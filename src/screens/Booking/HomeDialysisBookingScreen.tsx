import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import Stepper from '../../components/Stepper';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import PackageListDetails from '../../components/HomeDialysisBookingSteps/PackageListDetails';
import DoctorListing from '../../components/HomeDialysisBookingSteps/DoctorListing';
import UploadFileStep from '../../components/HomeDialysisBookingSteps/UploadFileStep';
import AddMoreService from '../../components/HomeDialysisBookingSteps/AddMoreService';
import Header from '../../components/common/Header';

const HomeDialysisBookingScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [1, 2, 3];
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PackageListDetails onPressNext={() => setCurrentStep(2)} onPressBack={() => setCurrentStep(1)} />;
      case 2: return <DoctorListing onPressNext={() => setCurrentStep(3)} onPressBack={() => setCurrentStep(1)} />;
      case 3: return <UploadFileStep onPressNext={() => setCurrentStep(4)} onPressBack={() => setCurrentStep(2)} />;
      case 4: return <AddMoreService onPressNext={() => { }} onPressBack={() => setCurrentStep(3)} />;
      default: return null;
    }
  };

  console.log("currentStep",currentStep)

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fff', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.515, y: 0.5 }}
        style={styles.container}
      >
        <View style={{ paddingHorizontal: 16, alignItems: 'center', paddingTop: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>{"غسيل الكلى المنزلي"}</Text>
        </View>
        <Stepper currentStep={currentStep} steps={steps} />
        <View style={styles.content}>
          {renderStep()}
        </View>
        {/* Sticky Bottom Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#f0f0f0' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '48%' }}>
            {currentStep > 1 && <TouchableOpacity onPress={() => currentStep >1 && setCurrentStep(currentStep - 1)} style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', width: '48%' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>السابق</Text>
            </TouchableOpacity>}
            <TouchableOpacity style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', width: '48%' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}> الغاء الامر</Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity onPress={() => setCurrentStep(currentStep + 1)} style={{ backgroundColor: '#239ea0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', width: '30%' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>التالي</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, backgroundColor: '#eceff4', padding: 16, borderRadius: 16 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  headerContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f3f2',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2d3a3a',
  },
  closeIcon: {
    fontSize: 22,
    color: '#888',
  },
  modalContent: {
    padding: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: '#2d3a3a',
    marginBottom: 24,
    textAlign: 'left',
  },
  modalButton: {
    backgroundColor: '#27a6a1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#27a6a1',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'gray',
    borderRadius: 30,
    marginRight: 10,
  },
  image: {
    width: 40,
    height: 40,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#008080',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#008080',
  },
  rememberText: {
    fontSize: 12,
    color: '#666',
  },
});

export default HomeDialysisBookingScreen; 