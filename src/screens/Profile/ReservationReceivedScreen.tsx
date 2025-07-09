import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import Header from '../../components/common/Header';
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { ROUTES } from '../../shared/utils/routes';
import { useTranslation } from 'react-i18next';

const ReservationReceivedScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();

    const handleBack = () => {
        navigation.goBack();
      };

    const renderHeader = () => (
        <Header
          centerComponent={
            <Text style={styles.headerTitle}>{t('update_profile')}</Text>
          }
          leftComponent={
            <TouchableOpacity onPress={handleBack} style={styles.bookButton}>
              <ArrowRightIcon />
            </TouchableOpacity>
          }
          containerStyle={styles.headerContainer}
        />
      );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.contentContainer}>
        <Text>Update Profile</Text>
      </View>
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
})

export default ReservationReceivedScreen