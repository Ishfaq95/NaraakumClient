// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { Platform, PermissionsAndroid, Alert, Share } from 'react-native';
import moment from 'moment';

interface HospitalInfo {
  CatCategoryId: number;
  FullnameSlang: string;
  LogoImagePath: string;
  TitleSlang: string;
  OrderId: string;
  VisitDate: string;
}

interface Medicine {
  Id: string;
  MedicineName: string;
  Title: string;
  Duration: string;
  TimeUnitSlang: string;
  Dose: string;
  Unit: string;
  Frequency: string;
  Quantity: string;
  Description: string;
}

interface TreatmentPlan {
  Medicines: Medicine[];
  Procedure: Procedure[];
  Refer: Refer[];
  Notes: Notes[];
}

interface PrescriptionData {
  HospitalInfo: HospitalInfo[];
  TreatmentPlan: TreatmentPlan[];
  PatientName?: string;
}

interface PatientComplaint {
  ChiefComplaint: string;
  PresentIllness: string;
  OtherComplaint: string;
  DurationOfComplaint: number;
  CatTimeUnitId: number;
}

interface PatientHistory {
  PMH: string;
  PSH: string;
  Allergy: string;
  CurrentMeds: string;
}

interface VitalSigns {
  Tem: string;
  HR: string;
  P4O2: string;
  RR: string;
  Bp: string;
}

interface OE {
  Title: string;
  BodyAnatomyTitle: string;
  InputValue: string;
}

interface LabXRay {
  FileTypeTitleSlang: string;
  FilePath: string;
}

interface DiagnosisDetail {
  Code: string;
  Diagnosis: string;
}

interface Diagnosis {
  CatDxType: number;
  DiagnosisSpecialtyTitle: string;
  Detail: DiagnosisDetail[];
}

interface PatientAssessment {
  VitalSigns: VitalSigns[];
  OE: OE[];
  LabXRays: LabXRay[];
  Diagnosis: Diagnosis[];
}

interface Procedure {
  Procedurees: string;
  Comments: string;
}

interface Refer {
  Title: string;
  ReferTo: string;
  Organization: string;
}

interface Notes {
  Notes: string;
  Instructions: string;
}

interface AddedService {
  TitleSlang: string;
  CatcategoryId: string;
  SpecialtyTitleSlang: string;
  Quantity: string;
}

interface VisitHistoryData {
  HospitalInfo: HospitalInfo[];
  PatientComplaint: PatientComplaint[];
  PatientHistory: PatientHistory[];
  PatientAssessment: PatientAssessment[];
  TreatmentPlan: TreatmentPlan[];
  AddedService: AddedService[];
  PatientName?: string;
}

const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const androidVersion = Number(Platform.Version);
    
    if (androidVersion >= 30) {
      return true;
    } else {
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
      // For iOS, we need to use the file:// protocol
      const fileUrl = `file://${filePath}`;

      await Share.share({
        url: fileUrl,
        title: fileName,
        message: `Sharing ${fileName}`
      });
    } catch (error) {
      console.error('Share error:', error);
      // Fallback: try to copy file to a more accessible location
      try {
        const { fs } = RNFetchBlob;
        const DocumentDir = fs.dirs.DocumentDir;
        const newPath = `${DocumentDir}/Shared/${fileName}`;

        // Create directory if it doesn't exist
        await fs.mkdir(`${DocumentDir}/Shared`);

        // Copy file to shared location
        await fs.cp(filePath, newPath);

        Alert.alert(
          'File Copied',
          'File has been copied to a shared location. You can find it in the Files app under "On My iPhone/iPad" > "Documents" > "Shared".',
          [
            {
              text: 'Open Files App',
              onPress: () => {
                // This will open the Files app
                const filesUrl = 'shortcuts://run-shortcut?name=Files';
                // Note: This is a fallback, the actual implementation might vary
                Alert.alert('Files App', 'Please open the Files app manually and navigate to "On My iPhone/iPad" > "Documents" > "Shared" to find your file.');
              }
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      } catch (copyError) {
        console.error('Copy error:', copyError);
        Alert.alert('Error', 'Could not copy file to shared location. Please try downloading again.');
      }
    }
  };

const downloadFileForPrescription = async (filePath: string, fileName: string): Promise<string> => {
  const { fs } = RNFetchBlob;

  try {
    let destinationPath = '';

    if (Platform.OS === 'android') {
      const androidVersion = Number(Platform.Version);
      const needsPermission = androidVersion < 30;
      
      if (needsPermission) {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          destinationPath = `${fs.dirs.DownloadDir}/${fileName}.pdf`;
          await RNFS.copyFile(filePath, destinationPath);
          Alert.alert(
            'تم تنزيل الملف بنجاح',
            'تم حفظ الملف في التخزين الداخلي'
          );
          return destinationPath;
        }
      }

      try {
        destinationPath = `/storage/emulated/0/Download/${fileName}.pdf`;
        await RNFS.copyFile(filePath, destinationPath);
        Alert.alert(
          'تم تنزيل الملف بنجاح',
          'تم حفظ الملف في مجلد التنزيل'
        );
      } catch (externalError) {
        console.log('External download failed, using internal storage:', externalError);
        destinationPath = `${fs.dirs.DownloadDir}/${fileName}.pdf`;
        await RNFS.copyFile(filePath, destinationPath);
        Alert.alert(
          'تم تنزيل الملف بنجاح',
          'تم حفظ الملف في التخزين الداخلي'
        );
      }
    } else {
      // iOS - Generate unique filename to avoid conflicts
      const timestamp = moment().locale('en').format('YYYYMMDD_HHmmss_SSS');
      const uniqueFileName = `${fileName}_${timestamp}.pdf`;
      destinationPath = `${RNFS.DocumentDirectoryPath}/${uniqueFileName}`;
      
      try {
        await RNFS.copyFile(filePath, destinationPath);
        await shareFile(filePath, fileName);
      } catch (copyError) {
        console.log('Copy failed, trying to share file directly:', copyError);
        // If copy fails, try to share the original file
        await shareFile(filePath, fileName);
        return filePath; // Return original path if sharing succeeds
      }
    }

    return destinationPath;
  } catch (error) {
    console.error('Error copying file:', error);
    Alert.alert('خطأ في تنزيل الملف', error instanceof Error ? error.message : 'خطأ غير معروف');
    throw error;
  }
};

const createMedicineHTML = (medicines: Medicine[]): string => {
  if (!medicines || medicines.length === 0) {
    return '<p style="text-align: center; color: #666; font-family: Cairo, Arial, sans-serif;">لا توجد أدوية</p>';
  }

  return medicines.map(medicine => `
    <div style="border: 1px solid #ddd; margin-bottom: 10px; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">
      <table style="width: 100%; border-collapse: collapse; font-family: Cairo, Arial, sans-serif;">
        <tr>
          <td style="padding: 5px; font-weight: bold; color: #23a2a4;">اسم الدواء:</td>
          <td style="padding: 5px;">${medicine.MedicineName || ''}</td>
          <td style="padding: 5px; font-weight: bold; color: #23a2a4;">نوع الدواء:</td>
          <td style="padding: 5px;">${medicine.Title || ''}</td>
        </tr>
        <tr>
          <td style="padding: 5px; font-weight: bold; color: #23a2a4;">المدة:</td>
          <td style="padding: 5px;">${medicine.Duration || ''} ${medicine.TimeUnitSlang || ''}</td>
          <td style="padding: 5px; font-weight: bold; color: #23a2a4;">الجرعة:</td>
          <td style="padding: 5px;">${medicine.Dose || ''} ${medicine.Unit || ''}</td>
        </tr>
        <tr>
          <td style="padding: 5px; font-weight: bold; color: #23a2a4;">التكرار:</td>
          <td style="padding: 5px;">${medicine.Frequency || ''}</td>
          <td style="padding: 5px; font-weight: bold; color: #23a2a4;">الكمية:</td>
          <td style="padding: 5px;">${medicine.Quantity || ''}</td>
        </tr>
        ${medicine.Description ? `
        <tr>
          <td style="padding: 5px; font-weight: bold; color: #23a2a4;">الوصف:</td>
          <td colspan="3" style="padding: 5px;">${medicine.Description}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `).join('');
};

const createOEHTML = (oeList: OE[]): string => {
  if (!oeList || oeList.length === 0) {
    return '<p style="text-align: center; color: #666; font-family: Cairo, Arial, sans-serif;">لا توجد بيانات</p>';
  }

  const sortedOE = oeList.sort((a, b) => a.Title.localeCompare(b.Title));
  const parentIDList: string[] = [];
  let html = '';

  sortedOE.forEach(obj => {
    const exists = parentIDList.includes(obj.Title);
    
    if (!exists) {
      parentIDList.push(obj.Title);
      html += `<h6 style="margin: 10px 0 5px 0; color: #23a2a4; font-family: Cairo, Arial, sans-serif;">${obj.Title}</h6>`;
    }
    
    html += `
      <div style="margin-bottom: 5px; padding: 5px; background-color: #f9f9f9; border-radius: 3px;">
        <span style="font-weight: bold; color: #23a2a4;">${obj.BodyAnatomyTitle}:</span>
        <span style="margin-right: 10px;">${obj.InputValue}</span>
      </div>
    `;
  });

  return html;
};

const createDiagnosisHTML = (diagnosisList: Diagnosis[]): string => {
  if (!diagnosisList || diagnosisList.length === 0) {
    return '<p style="text-align: center; color: #666; font-family: Cairo, Arial, sans-serif;">لا توجد تشخيصات</p>';
  }

  let html = '';
  
  // Provisional Diagnosis (CatDxType == 1)
  const provisional = diagnosisList.filter(dx => dx.CatDxType === 1);
  if (provisional.length > 0) {
    html += '<h6 style="text-align: left; margin: 15px 0 10px 0; color: #23a2a4; font-family: Cairo, Arial, sans-serif;">Provisional Dx</h6>';
    
    provisional.forEach(dx => {
      html += `<h6 style="margin: 10px 0 5px 0; color: #23a2a4; font-family: Cairo, Arial, sans-serif;">${dx.DiagnosisSpecialtyTitle}</h6>`;
      
      dx.Detail.forEach(icd => {
        html += `
          <div style="margin-bottom: 5px; padding: 5px; background-color: #f9f9f9; border-radius: 3px;">
            <span style="font-weight: bold; color: #23a2a4;">${icd.Code}:</span>
            <span style="margin-right: 10px;">${icd.Diagnosis}</span>
          </div>
        `;
      });
    });
  }

  // Differential Diagnosis (CatDxType == 2)
  const differential = diagnosisList.filter(dx => dx.CatDxType === 2);
  if (differential.length > 0) {
    html += '<h6 style="text-align: left; margin: 15px 0 10px 0; color: #23a2a4; font-family: Cairo, Arial, sans-serif;">Differential Dx</h6>';
    
    differential.forEach(dx => {
      html += `<h6 style="margin: 10px 0 5px 0; color: #23a2a4; font-family: Cairo, Arial, sans-serif;">${dx.DiagnosisSpecialtyTitle}</h6>`;
      
      dx.Detail.forEach(icd => {
        html += `
          <div style="margin-bottom: 5px; padding: 5px; background-color: #f9f9f9; border-radius: 3px;">
            <span style="font-weight: bold; color: #23a2a4;">${icd.Code}:</span>
            <span style="margin-right: 10px;">${icd.Diagnosis}</span>
          </div>
        `;
      });
    });
  }

  return html;
};

const createLabXRayHTML = (labXRayList: LabXRay[]): string => {
  if (!labXRayList || labXRayList.length === 0) {
    return '<p style="text-align: center; color: #666; font-family: Cairo, Arial, sans-serif;">لا توجد ملفات</p>';
  }

  return labXRayList.map(obj => `
    <div style="border: 1px solid #ddd; margin-bottom: 10px; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">
      <div style="font-weight: bold; color: #23a2a4; margin-bottom: 5px;">${obj.FileTypeTitleSlang}</div>
      <div style="color: #666; font-size: 12px;">File Type: ${obj.FileTypeTitleSlang}</div>
    </div>
  `).join('');
};

const createAddedServiceHTML = (addedServiceList: AddedService[]): string => {
  if (!addedServiceList || addedServiceList.length === 0) {
    return '<p style="text-align: center; color: #666; font-family: Cairo, Arial, sans-serif;">لا توجد خدمات إضافية</p>';
  }

  return addedServiceList.map(obj => {
    let serviceName = obj.TitleSlang;
    
    if (obj.CatcategoryId === '42' || obj.CatcategoryId === '41') {
      const consultationType = obj.CatcategoryId === '42' ? 'استشارة عن بعد' : 'استشارة فيديو';
      serviceName = `${consultationType} / ${serviceName}`;
    }
    
    if (obj.SpecialtyTitleSlang) {
      serviceName += ` (${obj.SpecialtyTitleSlang})`;
    }
    
    return `
      <div style="border: 1px solid #ddd; margin-bottom: 5px; padding: 8px; border-radius: 3px; background-color: #f9f9f9;">
        <span style="font-weight: bold; color: #23a2a4;">${serviceName}</span>
        <span style="margin-right: 10px; color: #666;">الكمية: ${obj.Quantity}</span>
      </div>
    `;
  }).join('');
};

const createPrescriptionHTML = (data: PrescriptionData): string => {
  const hospitalInfo = data.HospitalInfo?.[0];
  const treatmentPlan = data.TreatmentPlan?.[0];
  const patientName = data.PatientName || 'مريض';
  
  const isSession = hospitalInfo?.CatCategoryId === 42;
  const visitDateLabel = isSession ? 'تاريخ الجلسة' : 'تاريخ الزيارة';
  const visitHeaderLabel = isSession ? 'سجل الجلسة' : 'سجل الزيارة';
  
  const visitDate = hospitalInfo?.VisitDate ? 
    moment(hospitalInfo.VisitDate).locale('en').format('DD/MM/YYYY') : '';

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>وصفة طبية</title>
      <style>
        @font-face {
          font-family: 'Cairo';
          src: url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
        }
        body {
          font-family: 'Cairo', Arial, sans-serif;
          font-size: 13px;
          color: #1D1D1D;
          margin: 0;
          padding: 20px;
          direction: rtl;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
          border-bottom: 3px solid #ccc;
          padding-bottom: 20px;
        }
        .logo {
          text-align: left;
        }
        .contact-info {
          text-align: center;
        }
        .title-section {
          text-align: right;
          width: 180px;
        }
        .title-section h2 {
          font-size: 24px;
          margin: 0 0 5px 0;
        }
        .patient-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .patient-name {
          font-size: 20px;
          font-weight: bold;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #ccc;
          margin-bottom: 20px;
        }
        .info-table th {
          background: #32A3A4;
          color: #FFF;
          padding: 10px;
          text-align: right;
          border: 1px solid #FFF;
        }
        .info-table td {
          padding: 10px;
          border: 1px solid #FFF;
          text-align: right;
        }
        .info-table tr:nth-child(even) td {
          background: #F4FDFE;
        }
        .label {
          font-weight: bold;
          white-space: nowrap;
        }
        .value {
          word-break: break-all;
        }
        .section-title {
          background: #32A3A4;
          color: #FFF;
          padding: 10px;
          margin: 20px 0 10px 0;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
        }
        .sub-section {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        .sub-section h5 {
          margin: 0 0 10px 0;
          color: #23a2a4;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Logo" style="width: 100px; height: 50px;" />
        </div>
        <div class="contact-info">
          <p style="margin: 0; text-decoration: underline;">info@naraakum.com</p>
        </div>
        <div class="title-section">
          <h2>${visitHeaderLabel}</h2>
          <p style="margin: 0; text-decoration: underline;">www.naraakum.com</p>
        </div>
      </div>
      
      <div class="patient-info">
        <div>
          <span class="label">اسم المريض:</span> <span class="patient-name">${patientName}</span>
        </div>
      </div>
      
      <div class="section-title">المستشفى</div>
      <table class="info-table">
        <tr>
          <td class="value">${hospitalInfo?.TitleSlang || ''}</td>
          <td class="label">المستشفى</td>
        </tr>
        <tr>
          <td class="value">${hospitalInfo?.FullnameSlang || ''}</td>
          <td class="label">مقدم الرعاية</td>
        </tr>
        <tr>
          <td class="value">${hospitalInfo?.OrderId || ''}</td>
          <td class="label">رقم الطلب</td>
        </tr>
        <tr>
          <td class="value">${visitDate}</td>
          <td class="label">${visitDateLabel}</td>
        </tr>
      </table>
      
      <div class="section-title">الخطة العلاجية</div>
      <div class="sub-section">
        <h5>وصفة طبية</h5>
        <div class="box-body">
          ${createMedicineHTML(treatmentPlan?.Medicines || [])}
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generatePrescriptionPDF = async (data: PrescriptionData): Promise<string> => {
  try {
    // Create HTML content for the prescription PDF
    const htmlContent = createPrescriptionHTML(data);

    // Generate PDF
    const fileName = `Naraakum_Prescription_${data.HospitalInfo?.[0]?.OrderId || 'Patient'}_${moment().locale('en').format('YYYYMMDD_HHmmss')}`;

    const options = {
      html: htmlContent,
      fileName: fileName,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);

    if (file.filePath) {
      const downloadPath = await downloadFileForPrescription(file.filePath, fileName);
      return downloadPath;
    } else {
      throw new Error('Failed to generate PDF');
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    Alert.alert('خطأ', 'فشل في إنشاء ملف PDF للوصفة الطبية');
    throw error;
  }
};

const createVisitHistoryHTML = (data: VisitHistoryData): string => {
  const hospitalInfo = data.HospitalInfo?.[0];
  const patientComplaint = data.PatientComplaint?.[0];
  const patientHistory = data.PatientHistory?.[0];
  const patientAssessment = data.PatientAssessment?.[0];
  const treatmentPlan = data.TreatmentPlan?.[0];
  const patientName = data.PatientName || 'مريض';
  
  const isSession = hospitalInfo?.CatCategoryId === 42;
  const visitDateLabel = isSession ? 'تاريخ الجلسة' : 'تاريخ الزيارة';
  const visitHeaderLabel = isSession ? 'سجل الجلسة' : 'سجل الزيارة';
  
  const visitDate = hospitalInfo?.VisitDate ? 
    moment(hospitalInfo.VisitDate).locale('en').format('DD/MM/YYYY') : '';

  // Process patient complaint data
  const durationOfComplaint = patientComplaint?.DurationOfComplaint || 0;
  const durationText = durationOfComplaint > 0 ? `${durationOfComplaint} يوم` : '';

  // Process patient history data
  const pmh = patientHistory?.PMH?.replace(/#/g, ', ') || '';
  const psh = patientHistory?.PSH?.replace(/#/g, ', ') || '';
  const allergy = patientHistory?.Allergy?.replace(/#/g, ', ') || '';
  const currentMeds = patientHistory?.CurrentMeds?.replace(/#/g, ', ') || '';

  // Process vital signs
  const vitalSigns = patientAssessment?.VitalSigns?.[0];

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>سجل الزيارة</title>
      <style>
        @font-face {
          font-family: 'Cairo';
          src: url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
        }
        body {
          font-family: 'Cairo', Arial, sans-serif;
          font-size: 13px;
          color: #1D1D1D;
          margin: 0;
          padding: 20px;
          direction: rtl;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
          border-bottom: 3px solid #ccc;
          padding-bottom: 20px;
        }
        .logo {
          text-align: left;
        }
        .contact-info {
          text-align: center;
        }
        .title-section {
          text-align: right;
          width: 180px;
        }
        .title-section h2 {
          font-size: 24px;
          margin: 0 0 5px 0;
        }
        .patient-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .patient-name {
          font-size: 20px;
          font-weight: bold;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #ccc;
          margin-bottom: 20px;
        }
        .info-table th {
          background: #32A3A4;
          color: #FFF;
          padding: 10px;
          text-align: right;
          border: 1px solid #FFF;
        }
        .info-table td {
          padding: 10px;
          border: 1px solid #FFF;
          text-align: right;
        }
        .info-table tr:nth-child(even) td {
          background: #F4FDFE;
        }
        .label {
          font-weight: bold;
          white-space: nowrap;
        }
        .value {
          word-break: break-all;
        }
        .section-title {
          background: #32A3A4;
          color: #FFF;
          padding: 10px;
          margin: 20px 0 10px 0;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
        }
        .sub-section {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        .sub-section h5 {
          margin: 0 0 10px 0;
          color: #23a2a4;
          font-size: 14px;
        }
        .article {
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 3px;
        }
        .article:nth-child(odd) {
          background: #F4FDFE;
        }
        .article h6 {
          margin: 0 0 5px 0;
          color: #23a2a4;
          font-size: 13px;
        }
        .vital-signs-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ddd;
        }
        .vital-signs-table td {
          padding: 10px;
          text-align: center;
          border: 1px solid #ddd;
        }
        .vital-signs-table td:first-child {
          background: #F4FDFE;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Logo" style="width: 100px; height: 50px;" />
        </div>
        <div class="contact-info">
          <p style="margin: 0; text-decoration: underline;">info@naraakum.com</p>
        </div>
        <div class="title-section">
          <h2>${visitHeaderLabel}</h2>
          <p style="margin: 0; text-decoration: underline;">www.naraakum.com</p>
        </div>
      </div>
      
      <div class="patient-info">
        <div>
          <span class="label">اسم المريض:</span> <span class="patient-name">${patientName}</span>
        </div>
      </div>
      
      <div class="section-title">المستشفى</div>
      <table class="info-table">
        <tr>
          <td class="value">${hospitalInfo?.TitleSlang || ''}</td>
          <td class="label">المستشفى</td>
        </tr>
        <tr>
          <td class="value">${hospitalInfo?.FullnameSlang || ''}</td>
          <td class="label">مقدم الرعاية</td>
        </tr>
        <tr>
          <td class="value">${hospitalInfo?.OrderId || ''}</td>
          <td class="label">رقم الطلب</td>
        </tr>
        <tr>
          <td class="value">${visitDate}</td>
          <td class="label">${visitDateLabel}</td>
        </tr>
      </table>
      
      <div class="section-title">شكوى المريض</div>
      <div class="sub-section">
        <div class="article">
          <h6>الشكوى الرئيسية "CC"</h6>
          <p>${patientComplaint?.ChiefComplaint || ''}</p>
        </div>
        <div class="article">
          <h6>وصف الشكاوى</h6>
          <p>${patientComplaint?.PresentIllness || ''}</p>
        </div>
        <div class="article">
          <h6>مدة الشكاوى</h6>
          <p>${durationText}</p>
        </div>
        <div class="article">
          <h6>الشكاوى الأخرى</h6>
          <p>${patientComplaint?.OtherComplaint || ''}</p>
        </div>
      </div>
      
      <div class="section-title">سجل المريض</div>
      <table class="info-table">
        <tr>
          <td class="label" style="width: 50%;">السجل الطبي الماضي</td>
          <td class="value">${pmh}</td>
        </tr>
        <tr>
          <td class="label">السجل الجراحي الماضي</td>
          <td class="value">${psh}</td>
        </tr>
        <tr>
          <td class="label">حساسية</td>
          <td class="value">${allergy}</td>
        </tr>
        <tr>
          <td class="label">الأدوية الحالية</td>
          <td class="value">${currentMeds}</td>
        </tr>
      </table>
      
      <div class="section-title">تقييم المريض</div>
      <div class="sub-section">
        <h5>العلامات الحيوية</h5>
        <table class="vital-signs-table">
          <tr>
            <td>Tem</td>
            <td>H/R</td>
            <td>P4 02</td>
            <td>R/R</td>
            <td>BP</td>
          </tr>
          <tr>
            <td><b>${vitalSigns?.Tem || ''}</b></td>
            <td><b>${vitalSigns?.HR || ''}</b></td>
            <td><b>${vitalSigns?.P4O2 || ''}</b></td>
            <td><b>${vitalSigns?.RR || ''}</b></td>
            <td><b>${vitalSigns?.Bp || ''}</b></td>
          </tr>
        </table>
      </div>
      
      <div class="sub-section">
        <h5 style="text-align: left;">O/E</h5>
        <div class="box-body">
          ${createOEHTML(patientAssessment?.OE || [])}
        </div>
      </div>
      
      <div class="sub-section">
        <h5 style="text-align: left;">DX</h5>
        <div class="box-body">
          ${createDiagnosisHTML(patientAssessment?.Diagnosis || [])}
        </div>
      </div>
      
      <div class="sub-section">
        <h5>المختبر والأشعة</h5>
        <div class="box-body">
          ${createLabXRayHTML(patientAssessment?.LabXRays || [])}
        </div>
      </div>
      
      <div class="section-title">الخطة العلاجية</div>
      <div class="sub-section">
        <h5>الإجراءات</h5>
        <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; width: 50%;">
              <h6>الإجراء</h6>
              <p>${treatmentPlan?.Procedure?.[0]?.Procedurees || ''}</p>
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <h6>التعليق</h6>
              <p>${treatmentPlan?.Procedure?.[0]?.Comments || ''}</p>
            </td>
          </tr>
        </table>
      </div>
      
      <div class="sub-section">
        <h5>وصفة طبية</h5>
        <div class="box-body">
          ${createMedicineHTML(treatmentPlan?.Medicines || [])}
        </div>
      </div>
      
      <div class="sub-section">
        <h5>تعليمات المريض</h5>
        <div class="box-body">
          <p>${treatmentPlan?.Notes?.[0]?.Instructions || ''}</p>
        </div>
      </div>
      
      <div class="sub-section">
        <h5>خدمة جديدة</h5>
        <div class="box-body">
          ${createAddedServiceHTML(data.AddedService || [])}
        </div>
      </div>
      
      <div class="sub-section">
        <h5>التحويل/ الاستشارة</h5>
        <div class="box-body">
          <div class="article">
            <h6>التخصص</h6>
            <p>${treatmentPlan?.Refer?.[0]?.Title || ''}</p>
          </div>
          <div class="article">
            <h6>المنظمة</h6>
            <p>${treatmentPlan?.Refer?.[0]?.Organization || ''}</p>
          </div>
          <div class="article">
            <h6>سبب الإحالة</h6>
            <p>${treatmentPlan?.Refer?.[0]?.ReferTo || ''}</p>
          </div>
        </div>
      </div>
      
      <div class="sub-section">
        <h5>ملاحظات</h5>
        <div class="box-body">
          <p>${treatmentPlan?.Notes?.[0]?.Notes || ''}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateVisitHistoryPDF = async (data: VisitHistoryData): Promise<string> => {
  try {
    // Create HTML content for the visit history PDF
    const htmlContent = createVisitHistoryHTML(data);

    // Generate PDF
    const fileName = `Naraakum_VisitHistory_${data.HospitalInfo?.[0]?.OrderId || 'Patient'}_${moment().locale('en').format('YYYYMMDD_HHmmss')}`;

    const options = {
      html: htmlContent,
      fileName: fileName,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);

    if (file.filePath) {
      const downloadPath = await downloadFileForPrescription(file.filePath, fileName);
      return downloadPath;
    } else {
      throw new Error('Failed to generate PDF');
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    Alert.alert('خطأ', 'فشل في إنشاء ملف PDF لسجل الزيارة');
    throw error;
  }
};
