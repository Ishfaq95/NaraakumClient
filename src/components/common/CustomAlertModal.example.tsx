// This is an example component showing how to use CustomAlertModal
// You can copy these examples to your components

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAlert } from '../../contexts/AlertContext';
import { globalTextStyles } from '../../styles/globalStyles';

const AlertExamples = () => {
  const { showAlert } = useAlert();

  // Example 1: Simple Info Alert
  const showInfoAlert = () => {
    showAlert({
      title: 'معلومة',
      message: 'هذا مثال على رسالة معلومات بسيطة',
      type: 'info',
      confirmText: 'فهمت',
    });
  };

  // Example 2: Success Alert
  const showSuccessAlert = () => {
    showAlert({
      title: 'نجاح',
      message: 'تم حفظ البيانات بنجاح',
      type: 'success',
      confirmText: 'رائع',
    });
  };

  // Example 3: Warning Alert with Confirmation
  const showWarningAlert = () => {
    showAlert({
      title: 'تحذير',
      message: 'هل أنت متأكد من إلغاء الموعد؟',
      type: 'warning',
      showCancelButton: true,
      confirmText: 'نعم، إلغاء',
      cancelText: 'لا',
      onConfirm: () => {
        console.log('Appointment cancelled');
        // Add your cancellation logic here
      },
    });
  };

  // Example 4: Error Alert
  const showErrorAlert = () => {
    showAlert({
      title: 'خطأ',
      message: 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى',
      type: 'error',
      confirmText: 'إعادة المحاولة',
      onConfirm: () => {
        console.log('Retrying...');
        // Add retry logic here
      },
    });
  };

  // Example 5: Delete Confirmation
  const showDeleteConfirmation = () => {
    showAlert({
      title: 'حذف العنصر',
      message: 'لا يمكن التراجع عن هذا الإجراء. هل تريد المتابعة؟',
      type: 'error',
      showCancelButton: true,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: () => {
        console.log('Item deleted');
        // Add delete logic here
      },
    });
  };

  // Example 6: Notification Alert with Action
  const showNotificationAlert = () => {
    showAlert({
      title: 'إشعار جديد',
      message: 'لديك موعد قادم مع الدكتور أحمد في تمام الساعة 3:00 مساءً',
      type: 'info',
      confirmText: 'عرض التفاصيل',
      onConfirm: () => {
        console.log('Navigate to appointment details');
        // navigation.navigate('AppointmentDetails', { id: '123' });
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>أمثلة على CustomAlertModal</Text>

      <TouchableOpacity style={styles.button} onPress={showInfoAlert}>
        <Text style={styles.buttonText}>رسالة معلومات</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.successButton]} onPress={showSuccessAlert}>
        <Text style={styles.buttonText}>رسالة نجاح</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={showWarningAlert}>
        <Text style={styles.buttonText}>رسالة تحذير مع تأكيد</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={showErrorAlert}>
        <Text style={styles.buttonText}>رسالة خطأ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={showDeleteConfirmation}>
        <Text style={styles.buttonText}>تأكيد الحذف</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showNotificationAlert}>
        <Text style={styles.buttonText}>إشعار مع إجراء</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    ...globalTextStyles.h5,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#17a2b8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  errorButton: {
    backgroundColor: '#dc3545',
  },
  deleteButton: {
    backgroundColor: '#c82333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlertExamples;

