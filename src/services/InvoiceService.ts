// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
// import Share from 'react-native-share';
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

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

// Generate HTML for the invoice
const generateInvoiceHTML = (data: InvoiceData): string => {
  const invoiceNumber = `NAR-${data.OrderId}`;
  const invoiceDate = moment().format('DD/MM/YYYY');

  // Determine payment method
  let paymentMethod = 'محفظة';
  let cardNumber = '';

  if (data.CardNumber) {
    if (data.CardNumber.startsWith('5')) {
      paymentMethod = 'Mastercard';
      cardNumber = `xxxxxxxxxxxx${data.CardNumber.slice(-3)}`;
    } else if (data.CardNumber.startsWith('4')) {
      paymentMethod = 'Visa';
      cardNumber = `xxxxxxxxxxxx${data.CardNumber.slice(-3)}`;
    }
  }

  // Format service name
  let serviceName = `استشارة عن بعد / ${data.TitleSlangService}`;
  if (data.TitleSlangSpecialty) {
    serviceName += ` (${data.TitleSlangSpecialty})`;
  }

  // Format date and time
  const dateTimeUTC = moment.utc(`${data.SchedulingDate.split('T')[0]}T${data.SchedulingTime}`);
  const dateTimeLocal = dateTimeUTC.local();
  const schedulingDate = dateTimeLocal.format('DD/MM/YYYY');
  const schedulingTime = convertTo12Hour(dateTimeLocal.format('HH:mm'));

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة نرعاكم</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: #fff;
          padding: 20px;
        }
        
        .invoic-box {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #ddd;
          padding: 20px;
        }
        
        .invoic-header {
          border-bottom: 2px solid #23a2a4;
          padding-bottom: 20px;
          margin-bottom: 20px;
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
          font-weight: bold;
          color: #23a2a4;
          margin-bottom: 5px;
        }
        
        .logo span {
          color: #666;
          font-size: 11px;
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
          color: #23a2a4;
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
        }
        
        th {
          background: #23a2a4;
          color: white;
          font-weight: bold;
        }
        
        .table-dark th {
          background: #333;
        }
        
        .payment-information {
          margin: 20px 0;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 5px;
        }
        
        .payment-data {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .terms {
          background: #eee;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        
        .terms h3 {
          color: #23a2a4;
          margin-bottom: 10px;
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
        
        .total {
          background: #23a2a4;
          color: white;
          font-weight: bold;
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
          background: #f0f0f0;
        }
      </style>
    </head>
    <body>
      <div class="invoic-box">
        <header class="invoic-header float-start w-100">
          <div style="display: flex; justify-content: space-between; align-items: start; width: 100%;">
            <div class="logo">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" width="80" height="auto" alt="logo" />
              <p>نرعاكم للرعاية الصحية المنزلية</p>
              <span>www.naraakum.com</span>
            </div>
            <div class="info-list">
              <span>
                <p>رقم الفاتورة <b class="ms-3">${invoiceNumber}</b></p>
              </span>
              <span>
                <p>تاريخ الإصدار <b class="ms-3">${invoiceDate}</b></p>
              </span>
            </div>
          </div>
        </header>

        <section class="patient-information float-start w-100">
          <table class="table table-bordered mt-4">
            <thead>
              <tr>
                <th scope="col" class="text-start">المستفيد</th>
                <th scope="col" class="text-start">رقم الجوال</th>
                <th scope="col" class="text-start">البريد الإلكتروني</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${data.PatientSName}</td>
                <td><span dir="ltr">${data.PatientPhone}</span></td>
                <td>${data.PatientEmail}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="services-information float-start w-100">
          <table class="table table-bordered mt-4">
            <thead class="table-dark">
              <tr>
                <th scope="col" class="text-start">الخدمة</th>
                <th scope="col" class="text-start">العدد</th>
                <th scope="col" class="text-start">مقدم الرعاية</th>
                <th scope="col" class="text-start">تاريخ الجلسة</th>
                <th scope="col" class="text-start">السعر (SAR)</th>
                <th scope="col" class="text-start">الضريبة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${serviceName}</td>
                <td>1</td>
                <td>${data.ServiceProviderSName}</td>
                <td align="right">
                  <span class="date">
                    <p style="direction: ltr;">${schedulingDate} ${schedulingTime}</p>
                  </span>
                </td>
                <td>${data.ServicePrice.toString()}</td>
                <td>${data.TaxAmt.toString()}</td>
              </tr>
              <tr class="pt">
                <td colspan="5">
                  <p class="text-end">الخدمات</p>
                  <p class="text-end">الضريبة (15%)</p>
                </td>
                <td>
                  <p>${data.ServicePrice.toString()}</p>
                  <p>${data.TaxAmt.toString()}</p>
                </td>
              </tr>
              <tr>
                <td colspan="4"></td>
                <td colspan="1" class="bg-sub-color text-left">المجموع</td>
                <td class="bg-sub-color total">${data.ServiceCharges.toString()}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="payment-information float-start w-100">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="float: right;">
              <!-- QR Code placeholder -->
            </div>
            <div style="float: left;">
              <div class="payment-data">
                <span style="float: right;">
                  <p>السداد بواسطة</p>
                  <span>
                    <b>${paymentMethod}</b>
                  </span>
                </span>
                ${cardNumber ? `
                <span style="float: left; margin-right: 15px;">
                  <p>بطاقة رقم</p>
                  <b>${cardNumber}</b>
                </span>
                ` : ''}
              </div>
            </div>
          </div>
        </section>

        <section class="terms float-start w-100">
          <article>
            <h3>سياسة الالغاء والارجاع</h3>
            <p>
              للاطلاع على سياسة الالغاء والارجاع بشكل مفصل قم بالضغط
              <a target="_blank" href="https://www.naraakum.com/TermsCancellation">هنـا</a>
            </p>
          </article>
        </section>

        <footer class="invoic-footer float-start w-100">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="float: right;">
              <figure class="saudi-ministry">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="" style="float: right;" />
                <figcaption style="float: left; margin-right: 15px;">
                  <p>مرخص من قبل وزارة الصحة</p>
                  <p>تحت رقم <b>123456789</b></p>
                </figcaption>
              </figure>
            </div>
            <div style="float: left; margin-top: 15px;">
              <div class="info-list">
                <span>
                  <p>خدمة العملاء <b class="ms-3">+966 11 123 4567</b></p>
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
const generateInvoicePDF = async (data: InvoiceData): Promise<string> => {
  try {
    const html = generateInvoiceHTML(data);
    const fileName = `Naraakum_Invoice_${data.OrderId}`;

    const options = {
      html,
      fileName,
      directory: 'Documents',
      base64: false,
    };

    const file = await RNHTMLtoPDF.convert(options);

    if (file.filePath) {
      
      return file.filePath;
    } else {
      throw new Error('Failed to generate PDF');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

const downloadFIleForIOS = (url: any, fileName: any) => {
  const { config, fs } = RNFetchBlob;
  const DocumentDir = fs.dirs.DocumentDir; // Use DocumentDir for iOS
  const filePath = `${DocumentDir}/${fileName}`; // Set the file path to DocumentDir for iOS

  // Use config to set the download path and file handling
  config({
    fileCache: true,
    path: filePath, // Use the correct file path
  })
    .fetch('GET', url)
    .then(res => {
      Alert.alert(
        'File downloaded successfully',
        'The file is saved to your device.',
      );

      // Optional: Preview the document after downloading
      RNFetchBlob.ios.previewDocument(filePath); // Preview the downloaded document on iOS
    })
    .catch(error => {
      Alert.alert('File downloading error.');
    });
};

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
        Alert.alert(
          'File downloaded successfully',
          'Saved to internal storage'
        );
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
export const generateAndDownloadInvoice = async (data: InvoiceData) => {  
  try {
    const filePath = await generateInvoicePDF(data);
    const fileName = `Naraakum_Invoice_${data.OrderId}`;
  
    const downloadPath = await downloadFile(filePath, fileName);
    
    return downloadPath;
  } catch (error) {
    console.error('Error in generateAndDownloadInvoice:', error);
    throw error;
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