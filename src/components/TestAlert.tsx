import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAlert } from '../contexts/AlertContext';

// Simple test component to verify the alert is working
// You can add this to any screen temporarily to test

const TestAlert = () => {
  const { showAlert } = useAlert();

  const handleTestAlert = () => {
    console.log('Test Alert Button Pressed');
    showAlert({
      title: 'اختبار',
      message: 'هذه رسالة اختبار للتأكد من عمل النظام',
      type: 'info',
      confirmText: 'موافق',
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleTestAlert}>
        <Text style={styles.buttonText}>اختبار الإشعار</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#179c8e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestAlert;

