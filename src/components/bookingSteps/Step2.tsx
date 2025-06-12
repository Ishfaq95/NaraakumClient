import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';

const days = [
  { day: 'الأربع', date: '11' },
  { day: 'الخميس', date: '12' },
  { day: 'الجمع', date: '13' },
  { day: 'السبت', date: '14' },
  { day: 'الأحد', date: '15' },
  { day: 'الاثني', date: '16' },
  { day: 'الثلاثا', date: '17' },
  { day: '', date: '', icon: true }, // for calendar icon, replace with your icon
];

const CARD_MARGIN = 4;
const MIN_CARD_WIDTH = 48;
const MAX_CARD_WIDTH = 60;

const Step2 = () => {
  const screenWidth = Dimensions.get('window').width;
  // Calculate card width so that 8 cards fit, but not less than MIN_CARD_WIDTH
  const cardWidth = Math.max(
    (screenWidth - CARD_MARGIN * 2 * days.length) / days.length,
    MIN_CARD_WIDTH
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.card,
              {
                width: 33,
                // minWidth: MIN_CARD_WIDTH,
                // maxWidth: MAX_CARD_WIDTH,
                backgroundColor: index === 1 ? '#179c8e' : '#f7f7f7', // highlight selected
              },
            ]}
          >
            <Text style={[styles.date, index === 1 && { color: '#fff' }]}>{item.date}</Text>
            <Text style={[styles.day, index === 1 && { color: '#fff' }]}>{item.day}</Text>
            {/* Replace below with your icon if needed */}
            {item.icon && <Text style={{ fontSize: 18 }}>📅</Text>}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  list: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginHorizontal: CARD_MARGIN,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  day: {
    fontSize: 13,
    color: '#333',
  },
});

export default Step2; 