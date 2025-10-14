import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, I18nManager } from 'react-native';
import { globalTextStyles } from '../styles/globalStyles';

const colors = [ '#E5F3EF', '#BDF3F9', '#CEEAEB', '#D2DBEF', '#C6FAE4','#EFE4CF'];

const HomeVisitCard = ({ item,index,onPress }: { item: any,index:number,onPress:(item:any) => void }) => (
  <TouchableOpacity style={[styles.card]} onPress={() => onPress(item)}>
    <View style={[styles.iconContainer,{backgroundColor:colors[index]}]}>
      <Image source={{ uri: item.ImagePath }} style={styles.image} resizeMode="contain" />
    </View>
    <View style={styles.contentContainer}>
      <Text style={styles.title}>{item.TitleSlang}</Text>
      <Text style={styles.price}>
        تبدأ من <Text style={{ ...globalTextStyles.bodyLarge, color: '#179c8e', fontFamily: globalTextStyles.h5.fontFamily }}>{item.Price}</Text>
        ريال
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    // alignItems: 'center',
    borderWidth: 1,
    borderColor: '#179c8e',
    height:220,
    width:'45%'
  },
  iconContainer: {
    backgroundColor: '#e6f2f2',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: '60%',
    width: '100%',
    padding: 8,
    alignItems:'center',
    justifyContent:'center'
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  title: {
    ...globalTextStyles.bodyMedium,
    fontFamily: globalTextStyles.h5.fontFamily,
    marginBottom: 8,
    color: '#000',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    writingDirection: I18nManager.isRTL ? 'ltr' : 'rtl',
  },
  price: {
    ...globalTextStyles.bodySmall,
    color: '#444',
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    writingDirection: I18nManager.isRTL ? 'ltr' : 'rtl',
  },
  contentContainer: {
    flex: 1,
    paddingLeft: I18nManager.isRTL ? 10 : 0,
    paddingRight: I18nManager.isRTL ? 0 : 10,
    justifyContent: 'center',
  },
});

export default HomeVisitCard; 