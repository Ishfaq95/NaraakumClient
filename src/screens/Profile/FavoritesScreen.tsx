import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, Image, RefreshControl } from 'react-native'
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
import { globalTextStyles } from '../../styles/globalStyles';

const FavoritesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.root.user.user);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getUserFavorites();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserFavorites();
    setRefreshing(false);
  };

  const getUserFavorites = async () => {
    setIsLoading(true);
    const payload = {
      "UserLogininfoId": user?.Id,
    }
    const response = await profileService.getUserFavorites(payload);

    if (response?.ResponseStatus?.STATUSCODE == 200) {
      setFavorites(response?.Result);
    } else if (response?.ResponseStatus?.STATUSCODE == 201) {
      setFavorites([]);
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
        <Text style={[globalTextStyles.h3, styles.headerTitle]}>{t('user_favorites')}</Text>
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
      <View style={styles.itemContainer}>
        <View style={[{ flexDirection: 'row', width: '100%', borderRadius: 10, padding: 10 }]}>
          <View style={{ width: 80,height:80 }}>
            <View style={{ height: 70, width: 70, borderRadius: 40, backgroundColor: '#e0e0e0', marginBottom: 8, }}>
              {item.ImagePath || item.LogoImagePath ? (
                <Image
                  source={{ uri: item.ImagePath? `${MediaBaseURL}/${item.ImagePath}` :`${MediaBaseURL}/${item.LogoImagePath}` }}
                  style={styles.providerImage}
                  resizeMode='contain'
                />
              ) : (
                <UserPlaceholder width={70} height={70} />
              )}
            </View>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={[globalTextStyles.h6, styles.providerName]}>{item.FullnameSlang}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign name="star" size={16} color="#FFD700" />
              <Text style={[globalTextStyles.bodyMedium, styles.ratingText, { textAlign: 'center', marginHorizontal: 3,marginBottom:5 }]}>{item.AccumulativeRatingAvg.toFixed(1)}</Text>
              <Text style={[globalTextStyles.caption, { color: '#000' }]}> ({item.AccumulativeRatingNum} تقييم)</Text>

            </View>
          </View>
          <View style={{ width: '10%' }}>
            <AntDesign name="heart" size={24} color="#23a2a4" />
          </View>
        </View>
        <TouchableOpacity onPress={() => handleRemoveFromFavorites(item.Id)} style={{ height: 50, backgroundColor: '#23a2a4', marginHorizontal: 10, marginBottom: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[globalTextStyles.buttonMedium, { color: '#fff' }]}>{t('delete_account_button')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', }}>
        <Text style={[globalTextStyles.h5, { color: '#000', marginBottom: 10 }]}>قائمة المفضلة</Text>
        <Text style={[globalTextStyles.bodySmall, { color: '#000', marginBottom: 10, textAlign: 'center' }]}>سيظهر مقدمو الخدمات المفضلون لديك في أوائل النتائج عند طلب أي خدمة</Text>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.Id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#23a2a4']}
              tintColor="#23a2a4"
            />
          }
          ListEmptyComponent={() => <View style={{ flex: 1, paddingTop: 100, paddingBottom: 100 }}>
            <Text style={globalTextStyles.bodyMedium}>{t('no_favorites')}</Text>
          </View>}
        />
      </View>

      <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff5f5'
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#eff5f5',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
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
    backgroundColor: '#fff', marginBottom: 10,
    borderRadius: 10,
  },
  providerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  providerName: {
    marginTop: 4,
    marginBottom: 2,
    color: '#222',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
    fontWeight: '600',
  },
  ratingText: {
    color: '#222',
  },
})

export default FavoritesScreen