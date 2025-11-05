// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
// import Share from 'react-native-share';
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert, Platform, PermissionsAndroid, Share, Image } from 'react-native';
import { store } from '../shared/redux/store';

const NaraakumLogo = require('../assets/icons/NaraakumLogo.png');
const SaudiMinistryLogo = require('../assets/icons/Saudi_Ministry_logo.png');

interface InvoiceData {
  OrderId: string;
  TitleSlangService: string;
  TitleSlangSpecialty?: string;
  CardNumber?: string;
  TaxAmt: number;
  ServiceCharges: number;
  ServicePrice: number;
  ServiceProviderSName: string;
  SchedulingDate: string;
  SchedulingTime: string;
  PatientSName: string;
  PatientPhone: string;
  PatientEmail: string;
}

interface InvoiceServiceProps {
  data: InvoiceData;
  onSuccess?: (filePath: string) => void;
  onError?: (error: any) => void;
}

// Convert time from 24-hour to 12-hour format with Arabic AM/PM
const convertTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Get logo as base64 string
const getLogoBase64 = async (): Promise<string> => {
  try {
    // Use Image.resolveAssetSource to get the absolute path
    const resolvedImage = Image.resolveAssetSource(NaraakumLogo);
    
    if (!resolvedImage || !resolvedImage.uri) {
      throw new Error('Could not resolve logo asset');
    }
    
    console.log('Resolved logo URI:', resolvedImage.uri);
    
    let base64Image = '';
    
    // For web URIs (like http://), fetch and convert
    if (resolvedImage.uri.startsWith('http')) {
      const response = await RNFetchBlob.fetch('GET', resolvedImage.uri);
      base64Image = response.base64();
    } else {
      // For local files, read directly
      let filePath = resolvedImage.uri;
      
      // Handle different URI formats
      if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }
      
      // Try RNFS first
      try {
        base64Image = await RNFS.readFile(filePath, 'base64');
      } catch (rnfsError) {
        console.log('RNFS failed, trying RNFetchBlob:', rnfsError);
        // Fallback to RNFetchBlob
        const response = await RNFetchBlob.fs.readFile(filePath, 'base64');
        base64Image = response;
      }
    }
    
    if (!base64Image) {
      throw new Error('Failed to read logo image data');
    }
    
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error('Error loading logo:', error);
    // Return a fallback transparent pixel if logo fails to load
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
};

// Get Saudi Ministry logo as base64 string
const getMinistryLogoBase64 = async (): Promise<string> => {
  try {
    // Use Image.resolveAssetSource to get the absolute path
    const resolvedImage = Image.resolveAssetSource(SaudiMinistryLogo);
    
    if (!resolvedImage || !resolvedImage.uri) {
      throw new Error('Could not resolve ministry logo asset');
    }
    
    console.log('Resolved ministry logo URI:', resolvedImage.uri);
    
    let base64Image = '';
    
    // For web URIs (like http://), fetch and convert
    if (resolvedImage.uri.startsWith('http')) {
      const response = await RNFetchBlob.fetch('GET', resolvedImage.uri);
      base64Image = response.base64();
    } else {
      // For local files, read directly
      let filePath = resolvedImage.uri;
      
      // Handle different URI formats
      if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }
      
      // Try RNFS first
      try {
        base64Image = await RNFS.readFile(filePath, 'base64');
      } catch (rnfsError) {
        console.log('RNFS failed, trying RNFetchBlob:', rnfsError);
        // Fallback to RNFetchBlob
        const response = await RNFetchBlob.fs.readFile(filePath, 'base64');
        base64Image = response;
      }
    }
    
    if (!base64Image) {
      throw new Error('Failed to read ministry logo image data');
    }
    
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error('Error loading ministry logo:', error);
    // Return a fallback transparent pixel if logo fails to load
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
};

// Generate HTML for the invoice
const generateInvoiceHTML = async (data: any): Promise<string> => {
  const invoiceNumber = `NAR-${data[0].OrderID}`;
  const invoiceDate = moment().locale("en").format('DD/MM/YYYY');
  const userInfo = store.getState().root.user.user;

  // Get the logos as base64
  const logoBase64 = await getLogoBase64();
  const ministryLogoBase64 = await getMinistryLogoBase64();

  // Determine payment method
  let paymentMethod = 'محفظة';
  let cardNumber = '';

  if (data[0].CardNumber) {
    if (data[0].CardNumber.startsWith('5')) {
      paymentMethod = 'Mastercard';
      cardNumber = `xxxxxxxxxxxx${data[0].CardNumber.slice(-3)}`;
    } else if (data[0].CardNumber.startsWith('4')) {
      paymentMethod = 'Visa';
      cardNumber = `xxxxxxxxxxxx${data[0].CardNumber.slice(-3)}`;
    }
  }

  const calculateTotalTax = (data: any) =>{
    let totalTax = 0;
    data.forEach((item: any) => {
      if(item.CatNationalityId != "213"){
        totalTax += (parseFloat(item.ServicePrice) - parseFloat(item.ServiceCharges));
      }
    });
    return totalTax;
  }

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة نرعاكم</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Cairo', 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: #fff;
          padding: 20px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .logo {
          text-align: right;
        }
        
        .logo img {
          width: 80px;
          height: auto;
          margin-bottom: 10px;
        }
        
        .logo p {
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .logo span {
          font-family: 'Cairo', sans-serif;
          color: #666;
          font-size: 11px;
          font-weight: 400;
        }
        
        p {
          font-family: 'Cairo', sans-serif;
        }
        
        b, strong {
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
        }
        
        th {
          font-family: 'Cairo', sans-serif;
          font-weight: 600;
        }
        
        td {
          font-family: 'Cairo', sans-serif;
          font-weight: 400;
        }
        
        .info-list {
          text-align: left;
        }
        
        .info-list span {
          display: block;
          margin-bottom: 10px;
        }
        
        .info-list p {
          margin: 0;
        }
        
        .info-list b {
         
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .payment-information {
          margin: 20px 0;
          padding: 20px;
          background: #f9f9f9 !important;
          border-radius: 5px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .payment-data {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .terms {
          background: #eee !important;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .terms h3 {
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .terms p {
          font-family: 'Cairo', sans-serif;
          font-weight: 400;
        }
        
        a {
          font-family: 'Cairo', sans-serif;
        }
        
        .invoic-footer {
          border-top: 2px solid #23a2a4;
          padding-top: 20px;
          margin-top: 20px;
        }
        
        .saudi-ministry {
          display: flex;
          align-items: center;
        }
        
        .saudi-ministry img {
          width: 60px;
          height: auto;
          margin-left: 10px;
        }
        
        figcaption {
          font-family: 'Cairo', sans-serif;
        }
        
        figcaption p {
          font-family: 'Cairo', sans-serif;
        }
        
        span {
          font-family: 'Cairo', sans-serif;
        }
        
        .total {
          font-family: 'Cairo', sans-serif;
          background: #23a2a4 !important;
          color: white;
          font-weight: 700;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .text-end {
          text-align: right;
        }
        
        .text-start {
          text-align: left;
        }
        
        .float-start {
          float: right;
        }
        
        .float-end {
          float: left;
        }
        
        .w-100 {
          width: 100%;
        }
        
        .mt-4 {
          margin-top: 20px;
        }
        
        .ms-3 {
          margin-right: 15px;
        }
        
        .d-none {
          display: none;
        }
      
        .bg-sub-color {
          background-color:rgb(215, 28, 28) !important;
        }
      </style>
    </head>
    <body>
      <div class="invoic-box">
        <header class="invoic-header float-start w-100">
          <div style="display: flex; justify-content: space-between; align-items: start; width: 100%; font-family: 'Cairo', sans-serif;">
            <div class="logo">
              <img src="${logoBase64}" width="80" height="auto" alt="logo" />
              <p style="font-family: 'Cairo', sans-serif;">نرعاكم للرعاية الصحية المنزلية</p>
              <span style="font-family: 'Cairo', sans-serif;">www.naraakum.com</span>
            </div>
            <div class="info-list">
              <span style="font-family: 'Cairo', sans-serif;">
                <p style="font-family: 'Cairo', sans-serif;">رقم الفاتورة <b class="ms-3" style="font-family: 'Cairo', sans-serif;">${invoiceNumber}</b></p>
              </span>
              <span style="font-family: 'Cairo', sans-serif;">
                <p style="font-family: 'Cairo', sans-serif;">تاريخ الإصدار <b class="ms-3" style="font-family: 'Cairo', sans-serif;">${invoiceDate}</b></p>
              </span>
            </div>
          </div>
        </header>

        <section class="patient-information float-start w-100">
          <table class="table table-bordered mt-4">
            <thead>
              <tr>
                <th scope="col" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white; font-weight: bold;">المستفيد</th>
                <th scope="col" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white; font-weight: bold;">رقم الجوال</th>
                <th scope="col" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white; font-weight: bold;">البريد الإلكتروني</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family: 'Cairo', sans-serif;">${userInfo.FullnameSlang}</td>
                <td><span dir="ltr" style="font-family: 'Cairo', sans-serif;">${userInfo.CellNumber}</span></td>
                <td style="font-family: 'Cairo', sans-serif;">${userInfo.Email}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="services-information float-start w-100">
          <table class="table table-bordered mt-4">
            <thead class="table-dark">
              <tr>
                <th scope="col" class="text-end" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white;">الخدمة</th>
                <th scope="col" class="text-end" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white;">العدد</th>
                <th scope="col" class="text-end" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white;">مقدم الرعاية</th>
                <th scope="col" class="text-end" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white;">تاريخ الجلسة</th>
                <th scope="col" class="text-end" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white;">السعر (SAR)</th>
                <th scope="col" class="text-end" bgcolor="#23a2a4" style="font-family: 'Cairo', sans-serif; color: white;">الضريبة</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((item: any, index: number) => {
                // Format service name
                let serviceName = item.CatCategoryID == "42" ? `استشارة عن بعد / ${item.ServiceTitleSlang}` : `${item.ServiceTitleSlang}`;
                // if (item.TitleSlangSpecialty) {
                //   serviceName += ` (${item.TitleSlangSpecialty})`;
                // }

                // Format date and time
                const dateTimeUTC = moment.utc(`${item.SchedulingDate.split('T')[0]}T${item.SchedulingTime}`);
                const dateTimeLocal = dateTimeUTC.local();
                const schedulingDate = dateTimeLocal.locale('en').format('DD/MM/YYYY');
                const schedulingTime = convertTo12Hour(dateTimeLocal.locale('en').format('HH:mm'));
                const texCalculate = item.CatNationalityId == "213" ? item.ServicePrice : parseFloat(item.ServiceCharges) - parseFloat(item.ServicePrice);

                return `
                <tr>
                  <td style="font-family: 'Cairo', sans-serif;">${serviceName}</td>
                  <td style="font-family: 'Cairo', sans-serif;">1</td>
                  <td style="font-family: 'Cairo', sans-serif;">${item.ServiceProviderFullnameSlang}</td>
                  <td align="right">
                    <span class="date" style="font-family: 'Cairo', sans-serif;">
                      <p style="font-family: 'Cairo', sans-serif; direction: ltr;">${schedulingDate} ${schedulingTime}</p>
                    </span>
                  </td>
                  <td style="font-family: 'Cairo', sans-serif;">${item.ServicePrice?.toString() || 0}</td>
                  <td style="font-family: 'Cairo', sans-serif;">${texCalculate?.toString() || 0}</td>
                </tr>
                `;
              }).join('')}
              <tr class="pt">
                <td colspan="5" style="font-family: 'Cairo', sans-serif;">
                  <p class="text-end" style="font-family: 'Cairo', sans-serif;">الخدمات</p>
                  <p class="text-end" style="font-family: 'Cairo', sans-serif;">الضريبة (15%)</p>
                </td>
                <td style="font-family: 'Cairo', sans-serif;">
                  <p style="font-family: 'Cairo', sans-serif;">${data.reduce((sum: number, item: InvoiceData) => sum + item.ServicePrice, 0)?.toString()}</p>
                  <p style="font-family: 'Cairo', sans-serif;">${calculateTotalTax(data)}</p>
                </td>
              </tr>
              <tr>
                <td colspan="4"></td>
                <td colspan="1" class="text-left" bgcolor="#e4f1ef" style="font-family: 'Cairo', sans-serif; font-weight: bold;">المجموع</td>
                <td bgcolor="#e4f1ef" style="font-family: 'Cairo', sans-serif; color: #23a2a4; font-weight: bold;">${data.reduce((sum: number, item: InvoiceData) => sum + item.ServiceCharges, 0)?.toString()}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="payment-information float-start w-100" style="font-family: 'Cairo', sans-serif; margin: 20px 0; padding: 20px; background: #f9f9f9; -webkit-print-color-adjust: exact; print-color-adjust: exact; border-radius: 5px;">
          <div style="font-family: 'Cairo', sans-serif; display: flex; justify-content: space-between; align-items: start;">
            <div style="float: right;">
              <!-- QR Code placeholder -->
            </div>
            <div style="float: left;">
              <div class="payment-data">
                <span style="font-family: 'Cairo', sans-serif; float: right;">
                  <p style="font-family: 'Cairo', sans-serif;">السداد بواسطة</p>
                  <span style="font-family: 'Cairo', sans-serif;">
                    <b style="font-family: 'Cairo', sans-serif;">${paymentMethod}</b>
                  </span>
                </span>
                ${cardNumber ? `
                <span style="font-family: 'Cairo', sans-serif; float: left; margin-right: 15px;">
                  <p style="font-family: 'Cairo', sans-serif;">بطاقة رقم</p>
                  <b style="font-family: 'Cairo', sans-serif;">${cardNumber}</b>
                </span>
                ` : ''}
              </div>
            </div>
          </div>
        </section>

        <section class="terms float-start w-100" style="font-family: 'Cairo', sans-serif; background: #eee; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <article>
            <h3 style="font-family: 'Cairo', sans-serif; margin-bottom: 10px;">سياسة الالغاء والارجاع</h3>
            <p style="font-family: 'Cairo', sans-serif;">
              للاطلاع على سياسة الالغاء والارجاع بشكل مفصل قم بالضغط
              <a target="_blank" style="font-family: 'Cairo', sans-serif; color: #23a2a4;" href="https://www.naraakum.com/TermsCancellation">هنـا</a>
            </p>
          </article>
        </section>

        <footer class="invoic-footer float-start w-100">
          <div style="font-family: 'Cairo', sans-serif; display: flex; justify-content: space-between; align-items: center;">
            <div style="float: right;">
              <figure class="saudi-ministry">
                <img src="${ministryLogoBase64}" alt="Saudi Ministry of Health" width="60" height="auto" style="float: right;" />
                <figcaption style="font-family: 'Cairo', sans-serif; float: left; margin-right: 15px;">
                  <p style="font-family: 'Cairo', sans-serif;">مرخص من قبل وزارة الصحة</p>
                  <p style="font-family: 'Cairo', sans-serif;">تحت رقم <b style="font-family: 'Cairo', sans-serif;">123456789</b></p>
                </figcaption>
              </figure>
            </div>
            <div style="float: left; margin-top: 15px;">
              <div class="info-list">
                <span style="font-family: 'Cairo', sans-serif;">
                  <p style="font-family: 'Cairo', sans-serif;">خدمة العملاء <b class="ms-3" style="font-family: 'Cairo', sans-serif;">+966 11 123 4567</b></p>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </body>
    </html>
  `;

  return html;
};

// Generate PDF from HTML
const generateInvoicePDF = async (data: any): Promise<string> => {
  try {
    const html = await generateInvoiceHTML(data);
    
    // Add timestamp to make filename unique
    const timestamp = new Date().getTime();
    const fileName = `Naraakum_Invoice_${data[0].OrderID}_${timestamp}`;

    console.log('Generating PDF for invoice:', fileName);

    const options = {
      html,
      fileName,
      directory: 'Documents',
      base64: false,
      height: 842, // A4 height in points
      width: 595,  // A4 width in points
      padding: 10,
    };

    const file = await RNHTMLtoPDF.convert(options);

    if (file && file.filePath) {
      console.log('PDF generated successfully at:', file.filePath);
      return file.filePath;
    } else {
      console.error('Failed to generate PDF, no file path returned');
      throw new Error('Failed to generate PDF');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// const downloadFIleForIOS = (url: any, fileName: any) => {
//   const { config, fs } = RNFetchBlob;
//   const DocumentDir = fs.dirs.DocumentDir; // Use DocumentDir for iOS
//   const filePath = `${DocumentDir}/${fileName}`; // Set the file path to DocumentDir for iOS

//   // Use config to set the download path and file handling
//   config({
//     fileCache: true,
//     path: filePath, // Use the correct file path
//   })
//     .fetch('GET', url)
//     .then(res => {
//       Alert.alert(
//         'File downloaded successfully',
//         'The file is saved to your device.',
//       );

//       // Optional: Preview the document after downloading
//       RNFetchBlob.ios.previewDocument(filePath); // Preview the downloaded document on iOS
//     })
//     .catch(error => {
//       Alert.alert('File downloading error.');
//     });
// };

// Request storage permissions for Android
const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
          // For Android 11+ (API 30+), WRITE_EXTERNAL_STORAGE is deprecated
      // and not needed for accessing Downloads folder
      const androidVersion = Number(Platform.Version);
      
      if (androidVersion >= 30) {
      // Android 11+ - no permission needed for Downloads folder
      return true;
    } else {
      // Android 10 and below - request WRITE_EXTERNAL_STORAGE
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to storage to save PDF files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const shareFile = async (filePath: string, fileName: string) => {
  try {
    console.log('Sharing file from path:', filePath);
    
    // Ensure the file exists
    const fileExists = await RNFetchBlob.fs.exists(filePath);
    if (!fileExists) {
      console.error('File does not exist at path:', filePath);
      Alert.alert('Error', 'File does not exist. Please try again.');
      return;
    }
    
    // For iOS, we need to use the file:// protocol
    const fileUrl = Platform.OS === 'ios' ? `file://${filePath}` : filePath;
    
    // Check file size
    const fileInfo = await RNFetchBlob.fs.stat(filePath);
    console.log('File size:', fileInfo.size, 'bytes');
    
    if (Platform.OS === 'ios') {
      // On iOS, use RNFetchBlob's previewDocument for PDF files
      try {
        console.log('Opening PDF preview with path:', filePath);
        await RNFetchBlob.ios.previewDocument(filePath);
        console.log('PDF preview opened successfully');
      } catch (previewError) {
        console.error('Error previewing document:', previewError);
        
        // Fallback to share API if preview fails
        try {
          console.log('Falling back to Share API');
          await Share.share({
            url: fileUrl,
            title: fileName,
          });
        } catch (shareError) {
          console.error('Share API error:', shareError);
          throw shareError; // Re-throw to trigger the fallback copy
        }
      }
    } else {
      // On Android, use Share API
      await Share.share({
        url: fileUrl,
        title: fileName,
        message: `Sharing ${fileName}`
      });
    }
  } catch (error) {
    console.error('Share error:', error);
    
    // Fallback: try to copy file to a more accessible location
    try {
      const { fs } = RNFetchBlob;
      const DocumentDir = fs.dirs.DocumentDir;
      const SharedDir = `${DocumentDir}/Shared`;
      
      // Create directory if it doesn't exist
      const dirExists = await fs.exists(SharedDir);
      if (!dirExists) {
        console.log('Creating Shared directory');
        await fs.mkdir(SharedDir);
      }

      // Generate unique filename to avoid conflicts
      const timestamp = new Date().getTime();
      const uniqueFileName = fileName.replace('.pdf', `_${timestamp}.pdf`);
      const newPath = `${SharedDir}/${uniqueFileName}`;

      console.log('Copying file to:', newPath);
      
      // Copy file to shared location
      await fs.cp(filePath, newPath);
      console.log('File copied successfully to:', newPath);

      Alert.alert(
        'File Saved',
        'File has been saved to Documents folder. You can find it in the Files app under "On My iPhone/iPad" > "Documents" > "Shared".',
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
    } catch (copyError) {
      console.error('Copy error:', copyError);
      Alert.alert('Error', 'Could not save file. Please try again.');
    }
  }
};

const downloadFIleForIOS = (url: string, fileName: string) => {
  const { config, fs } = RNFetchBlob;

  // For iOS, we'll use the Documents directory and then share the file
  const DocumentDir = fs.dirs.DocumentDir;
  
  // Add timestamp to make filename unique
  const timestamp = new Date().getTime();
  const uniqueFileName = fileName.replace('.pdf', `_${timestamp}.pdf`);
  const filePath = `${DocumentDir}/${uniqueFileName}`;
  
  console.log('Downloading to unique path:', filePath);

  // Check if the URL is a local file path
  if (url.startsWith('file://') || url.startsWith('/')) {
    // It's already a local file, just copy it to the destination
    const sourcePath = url.startsWith('file://') ? url.replace('file://', '') : url;
    
    // Copy the file to the destination
    fs.cp(sourcePath, filePath)
      .then(() => {
        console.log('File copied successfully to:', filePath);
        shareFile(filePath, uniqueFileName);
      })
      .catch((error) => {
        console.error('Error copying file:', error);
        
        // If copy fails, try to use the original file directly
        console.log('Attempting to use source file directly:', sourcePath);
        shareFile(sourcePath, fileName);
      });
  } else {
    // It's a remote URL, download it
    config({
      fileCache: true,
      path: filePath,
      overwrite: true, // Overwrite if file exists
    })
      .fetch('GET', url)
      .then(res => {
        console.log('File downloaded successfully to:', res.path());
        shareFile(res.path(), uniqueFileName);
      })
      .catch(error => {
        console.error('Download error:', error);
        Alert.alert('File downloading error.', error.message || 'Unknown error');
      });
  }
};

// Download file for Android
const downloadFile = async (filePath: string, fileName: string): Promise<string> => {
  const { fs } = RNFetchBlob;

  try {
    let destinationPath = '';

    if (Platform.OS === 'android') {
              // Check if we need permission (Android 10 and below)
        const androidVersion = Number(Platform.Version);
        const needsPermission = androidVersion < 30;
      
      if (needsPermission) {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          // Use internal storage if permission denied
          destinationPath = `${fs.dirs.DownloadDir}/${fileName}.pdf`;
          await RNFS.copyFile(filePath, destinationPath);
          Alert.alert(
            'File downloaded successfully',
            'Saved to internal storage'
          );
          return destinationPath;
        }
      }

      // Try to save to external Downloads folder
      try {
        destinationPath = `/storage/emulated/0/Download/${fileName}.pdf`;
        await RNFS.copyFile(filePath, destinationPath);
        Alert.alert(
          'File downloaded successfully',
          'Saved to Downloads folder'
        );
      } catch (externalError) {
        // Fallback to internal Downloads
        destinationPath = `${fs.dirs.DownloadDir}/${fileName}.pdf`;
        await RNFS.copyFile(filePath, destinationPath);
        // Alert.alert(
        //   'File downloaded successfully',
        //   'Saved to internal storage'
        // );
      }
    } else {
      // iOS - use Documents directory
      destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;
      await RNFS.copyFile(filePath, destinationPath);
    }

    return destinationPath;
  } catch (error) {
    console.error('Error copying file:', error);
    Alert.alert('File downloading error.', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

// Generate and download invoice
export const generateAndDownloadInvoice = async (data: any) => {  
  try {
    const filePath = await generateInvoicePDF(data);
    
    // Extract the filename from the path
    const pathParts = filePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    console.log('Generated PDF at path:', filePath);
    console.log('Using filename:', fileName);
    
    if (Platform.OS === 'ios') {
      // On iOS, the filePath from RNHTMLtoPDF is already a local file path
      downloadFIleForIOS(filePath, fileName);
    } else {
      await downloadFile(filePath, fileName);
    }
    
  } catch (error) {
    console.error('Error in generateAndDownloadInvoice:', error);
    Alert.alert('Error', 'Failed to generate invoice. Please try again.');
  }
};

// Generate and share invoice
const generateAndShareInvoice = async (data: InvoiceData): Promise<void> => {
  try {
    const filePath = await generateInvoicePDF(data);
    const fileName = `Naraakum_Invoice_${data.OrderId}`;

    await downloadFile(filePath, fileName);
  } catch (error) {
    console.error('Error in generateAndShareInvoice:', error);
    throw error;
  }
};