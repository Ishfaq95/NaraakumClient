import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import FullScreenLoader from '../../components/FullScreenLoader';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import LocationMarkerIcon from '../../assets/icons/LocationMarkerIcon';
import { globalTextStyles } from '../../styles/globalStyles';

const MyAddressesScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const user = useSelector((state: RootState) => state.root.user.user);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getAddresses();
      }, []);

      const getAddresses = async () => {
        setIsLoading(true);
        const payload = {
            "UserLogininfoId": user?.Id,
        }
        const response = await profileService.getUserAddresses(payload);
        if (response?.ResponseStatus?.STATUSCODE == 200) {
            setAddresses(response?.Result);
        }
        setIsLoading(false);
      }
    const handleBack = () => {
        navigation.goBack();
      };

    const renderHeader = () => (
        <Header
          centerComponent={
            <Text style={styles.headerTitle}>{t('my_addresses')}</Text>
          }
          leftComponent={
            <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
              <ArrowRightIcon />
            </TouchableOpacity>
          }
          containerStyle={styles.headerContainer}
        />
      );

    const renderItem = ({ item }: any) => {
        return (
          <View
          style={[
            styles.savedAddressItem,
          ]}
        >
          <View style={styles.row}>
            <LocationMarkerIcon size={22} />
            <View style={styles.textContainer}>
              <Text style={[styles.title]}>{item.TitleSlang}</Text>
              <Text style={[styles.square]}>{item.SquareTitle}</Text>
              <Text style={[styles.description]}>{item.Description}</Text>
            </View>
          </View>
        </View>
        )
    }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', }}>
        <Text style={[globalTextStyles.bodyMedium, { fontWeight: 'bold', color: '#000', marginBottom: 10 }]}>عناوين الزيارات</Text>
        <Text style={[globalTextStyles.bodySmall, { fontWeight: '500', color: '#000', marginBottom: 10 }]}>يمكنك إضافة وتسجيل أكثر من عنوان لاستخدامها فى عملية الحجز</Text>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item) => item.Id.toString()}
          style={{ width: '100%', }}
          ListEmptyComponent={() => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <Text style={[globalTextStyles.bodyMedium, { fontWeight: '500', color: '#000' }]}>{t('no_addresses')}</Text>
          </View>}
        />
      </View>
      <TouchableOpacity style={{ height: 50,marginTop: 10, backgroundColor: '#23a2a4', marginHorizontal: 10, marginBottom: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[globalTextStyles.buttonMedium, { color: '#fff' }]}>{t('add_address')}</Text>
      </TouchableOpacity>
      <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  )
}

const styles=StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
 contentContainer: { 
    flex: 1, 
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
},
  headerTitle: {
    ...globalTextStyles.h3,
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
  savedAddressItem: {
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    textAlign: 'left',
  },
  square: {
    fontSize: 15,
    color: '#222',
    textAlign: 'left',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#888',
    textAlign: 'left',
    marginTop: 2,
  },
})

export default MyAddressesScreen