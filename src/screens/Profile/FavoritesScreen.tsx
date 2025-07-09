import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, Image } from 'react-native'
import Header from '../../components/common/Header';
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';
import { profileService } from '../../services/api/ProfileService';
import { useSelector } from 'react-redux';
import { RootState } from '../../shared/redux/store';
import { MediaBaseURL } from '../../shared/utils/constants';
import UserPlaceholder from '../../assets/icons/UserPlaceholder';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FullScreenLoader from '../../components/FullScreenLoader';

const FavoritesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.root.user.user);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    getUserFavorites();
  }, []);

  const getUserFavorites = async () => {
    setIsLoading(true);
    const payload = {
      "UserLogininfoId": user?.Id,
    }
    const response = await profileService.getUserFavorites(payload);

    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setFavorites(response?.Result);
    }
    setIsLoading(false);
  }

  const handleRemoveFromFavorites = async (id: string) => {
    setIsLoading(true);
    const payload = {
      "UserFavoritesId": id,
    }
    const response = await profileService.removeFromFavorites(payload);

    if (response?.ResponseStatus?.STATUSCODE == 200) {
      getUserFavorites();
    }
    setIsLoading(false);
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('user_favorites')}</Text>
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
    console.log("item", item);
    return (
      <View style={styles.itemContainer}>
      <View style={[{ flexDirection: 'row', width: '100%',  borderRadius: 10, padding: 10 }]}>
        <View style={{ width: '30%' }}>
          {item.ImagePath ? (
            <Image
              source={{ uri: `${MediaBaseURL}/${item.ImagePath}` }}
              style={styles.providerImage}
              resizeMode="cover"
            />
          ) : (
            <UserPlaceholder width={80} height={80} />
          )}
        </View>
        <View style={{ width: '60%' }}>
          <Text style={styles.providerName}>{item.FullnameSlang}</Text>
          <View style={{ flexDirection: 'row', marginVertical: 2 }}>
            <Text style={styles.ratingText}>{item.AccumulativeRatingAvg.toFixed(1)}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}> ({item.AccumulativeRatingNum} تقييم)</Text>
            <Text style={{ color: '#FFD700', marginLeft: 2 }}>★</Text>
          </View>
        </View>
        <View style={{ width: '10%' }}>
          <AntDesign name="heart" size={24} color="#23a2a4" />
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveFromFavorites(item.Id)} style={{ height: 50, backgroundColor: '#23a2a4',marginHorizontal: 10, marginBottom: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{t('delete_account_button')}</Text>
      </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{paddingHorizontal: 16, paddingVertical: 10,alignItems:'center',}}>
      <Text style={{fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 10}}>قائمة المفضلة</Text>
      <Text style={{fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 10}}>سيظهر مقدمو الخدمات المفضلون لديك في أوائل النتائج عند طلب أي خدمة</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.Id.toString()}
          ListEmptyComponent={() => <Text>{t('no_favorites')}</Text>}
        />
      </View>

      <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
  itemContainer: {
    width: '100%',
    backgroundColor: 'lightgray', marginBottom: 10,
    borderRadius: 10,
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  providerName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 2,
    color: '#222',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
  },
})

export default FavoritesScreen