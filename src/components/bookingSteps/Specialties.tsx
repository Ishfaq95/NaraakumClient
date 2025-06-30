import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet, I18nManager, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SearchInput from '../common/SearchInput';
import { bookingService } from '../../services/api/BookingService';
import { MediaBaseURL } from '../../shared/utils/constants';
import { SvgUri } from 'react-native-svg';
import FullScreenLoader from '../../components/FullScreenLoader';
import { setServices } from '../../shared/redux/reducers/bookingReducer';

const Specialties = ({onPressSpecialty}: {onPressSpecialty: (specialty: any) => void}) => {
  const category = useSelector((state: any) => state.root.booking.category);
  const [search, setSearch] = useState('');
  const [offeredServices, setOfferedServices] = useState<any>(null);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [offeredServicesData, setOfferedServicesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  console.log('category', category);
  
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
      console.log('offered', offered);
      setOfferedServicesData(offered);
      // dispatch(setServices(offered.OfferedServices));
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
    if (!search) return offeredServicesData?.OfferedServices || [];
    return (offeredServicesData?.OfferedServices || []).filter((item: any) =>
      (item.TitleSlang || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [search, offeredServicesData]);

  const getSanitizedImageUrl = (path: string) => {
    if (!path) return '';
    // Remove any double slashes after the protocol
    return `${MediaBaseURL}${path}`.replace(/([^:]\/)/g, "$1");
  };

  const renderItem = ({ item }: { item: any }) => {
    const uri = getSanitizedImageUrl(item.ImagePath);
    const isSvg = uri.endsWith('.svg');
    return (
      <TouchableOpacity onPress={() => onPressSpecialty(item)} style={styles.card} activeOpacity={0.8}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={2}>{item.TitleSlang}</Text>
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
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
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
        renderItem={renderItem}
        keyExtractor={(item, idx) => item.Id?.toString() || idx.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12, columnGap: 8 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />}
      </View>
      <FullScreenLoader visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  row: {
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
});

export default Specialties; 