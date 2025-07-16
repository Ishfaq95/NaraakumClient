import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet, I18nManager, ActivityIndicator, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SearchInput from '../common/SearchInput';
import { bookingService } from '../../services/api/BookingService';
import { MediaBaseURL } from '../../shared/utils/constants';
import { SvgUri } from 'react-native-svg';
import FullScreenLoader from '../../components/FullScreenLoader';
import { setServices } from '../../shared/redux/reducers/bookingReducer';
import { t } from 'i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalTextStyles } from '../../styles/globalStyles';

const Specialties = ({onPressSpecialty, onContinueWithService}: {onPressSpecialty: (specialty: any) => void, onContinueWithService: (service: any) => void}) => {
  const category = useSelector((state: any) => state.root.booking.category);
  const [search, setSearch] = useState('');
  const [offeredServices, setOfferedServices] = useState<any>(null);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [offeredServicesData, setOfferedServicesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (category) {
      if(category.Id == "42" || category.Id == "32") {
      fetchServicesAndSpecialtiesData();
      }else{
        fetchOfferedServicesData();
      }
    }
  }, [category]);

  const fetchServicesAndSpecialtiesData = async () => {
    try {
      setLoading(true);
      const offered = await bookingService.getOfferedServicesListByCategory({ abc: category?.Id, Search: '' });
      const specs = await bookingService.getAllSpecialties();
      setOfferedServices(offered);
      // Merge CatLevelId==3 object at the start of specialties
      let merged = Array.isArray(specs?.list) ? [...specs.list] : [];
      const general = offered?.OfferedServices?.find((item: any) => item.CatLevelId === 3);
      if (general) {
        merged = [general, ...merged];
      }
      dispatch(setServices(offered.OfferedServices));
      setSpecialties(merged); 
    } catch (error) {
      console.error('Error fetching booking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferedServicesData = async () => {
    try {
      setLoading(true);
      const offered = await bookingService.getOfferedServicesListByCategory({ abc: category?.Id, Search: '' });
      setOfferedServicesData(offered?.OfferedServices);
      dispatch(setServices(offered?.OfferedServices));
    } catch (error) {
      console.error('Error fetching booking data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter specialties by search
  const filteredSpecialties = useMemo(() => {
    if (!search) return specialties;
    return specialties.filter(item =>
      (item.TitleSlang || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [search, specialties]);

  // Filter offeredServicesData by search
  const filteredOfferedServices = useMemo(() => {
    if (!search) return offeredServicesData || [];
    return offeredServicesData.filter((item: any) =>
      (item.TitleSlang || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [search, offeredServicesData]);

  const getSanitizedImageUrl = (path: string) => {
    if (!path) return '';
    // Remove any double slashes after the protocol
    return `${MediaBaseURL}${path}`.replace(/([^:]\/)/g, "$1");
  };

  const toggleServiceSelection = (service: any) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(item => item.Id === service.Id);
      if (isSelected) {
        return prev.filter(item => item.Id !== service.Id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleContinuePress = () => {
    if (selectedServices.length > 0) {
      // For now, just pass the first selected service to maintain compatibility
      // You can modify this logic based on your requirements
      onContinueWithService(selectedServices);
    }
  };

  const renderSelectableItem = ({ item }: { item: any }) => {
    const uri = getSanitizedImageUrl(item.ImagePath);
    const isSvg = uri.endsWith('.svg');
    const isSelected = selectedServices.some(service => service.Id === item.Id);
    
    // Clean the TitleSlang by removing all types of line breaks
    const cleanTitle = item.TitleSlang?.replace(/[\r\n]+/g, ' ').trim() || '';
    
    return (
      <TouchableOpacity 
        onPress={() => toggleServiceSelection(item)} 
        style={[styles.card, isSelected && styles.selectedCard]} 
        activeOpacity={0.8}
      >
        <View style={styles.row}>
          <Text style={[styles.title, isSelected && styles.selectedTitle]} numberOfLines={2}>
            {cleanTitle}
          </Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <TouchableOpacity onPress={() => {
              setSelectedService(item);
              setShowServiceModal(true);
            }}>
              <Ionicons name="information-circle" size={16} color={isSelected ? "#fff" : "#23a2a4"} />
            </TouchableOpacity>
            <Text style={[globalTextStyles.caption, { color: isSelected ? "#fff" : "#2B3034", fontWeight: '500' }]}>
              {t('service_details')}
            </Text>
          </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const uri = getSanitizedImageUrl(item.ImagePath);
    const isSvg = uri.endsWith('.svg');
    
    // Clean the TitleSlang by removing all types of line breaks
    const cleanTitle = item.TitleSlang?.replace(/[\r\n]+/g, ' ').trim() || '';
    
    return (
      <TouchableOpacity onPress={() => onPressSpecialty(item)} style={styles.cardSpecialty} activeOpacity={0.8}>
        <View style={styles.rowSpecialty}>
          <Text style={styles.title} numberOfLines={2}>{cleanTitle}</Text>
          <View style={styles.imageContainer}>
            {item.ImagePath ? (
              isSvg ? (
                <SvgUri
                  width="90%"
                  height="90%"
                  uri={uri}
                />
              ) : (
                <Image source={{ uri }} style={styles.image} resizeMode="contain" />
              )
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, }}>
      <SearchInput
        placeholder="بحث عن التخصص"
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ flex: 1, paddingTop: 12 }}>
        
      {(category.Id == "42" || category.Id == "32") ?
      <FlatList
        data={filteredSpecialties}
        renderItem={renderItem}
        keyExtractor={(item, idx) => item.Id?.toString() || idx.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12, columnGap: 8 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />:
      <FlatList
        data={filteredOfferedServices}
        renderItem={renderSelectableItem}
        keyExtractor={(item, idx) => item.Id?.toString() || idx.toString()}
        numColumns={1}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />}
      </View>
      
      {/* Bottom Button for Multiple Selection */}
      {!(category.Id == "42" || category.Id == "32") && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, selectedServices.length === 0 && styles.disabledButton]}
            onPress={handleContinuePress}
            disabled={selectedServices.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {selectedServices.length > 0 
                ? `متابعة (${selectedServices.length} خدمة مختارة)` 
                : 'اختر خدمة واحدة على الأقل'
              }
            </Text>
          </TouchableOpacity>
        </View>
      )}

<Modal
        visible={showServiceModal}
        onRequestClose={() => setShowServiceModal(false)}
        transparent={true}
        animationType='fade'
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedService?.TitleSlang}</Text>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            {/* Message and Button */}
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>{selectedService?.DescriptionSlang}</Text>
              {/* <TouchableOpacity
                onPress={() => setShowServiceModal(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>يغلق</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </Modal>
      
      <FullScreenLoader visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2BA6A6',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  row: {
    flex: 1,
  },
  cardSpecialty: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2BA6A6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 54,
    maxHeight: 70,
    
  },
  rowSpecialty: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    color: '#2B3034',
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
    marginHorizontal: 6,
  },
  imageContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F6F8F9',
    borderTopRightRadius: I18nManager.isRTL ? 0 : 16,
    borderBottomRightRadius: I18nManager.isRTL ? 0 : 16,
    borderTopLeftRadius: I18nManager.isRTL ? 16 : 0,
    borderBottomLeftRadius: I18nManager.isRTL ? 16 : 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 60,
    height: 60,
  },
  webview: {
    width: 60,
    height: 60,
    backgroundColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#23a2a4',
  },
  selectedTitle: {
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedImageContainer: {
    backgroundColor: '#2BA6A6',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#2BA6A6',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    backgroundColor: '#2BA6A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
});

export default Specialties; 