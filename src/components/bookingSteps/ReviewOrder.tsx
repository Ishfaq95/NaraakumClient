import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import CalendarIcon from '../../assets/icons/CalendarIcon';
import ClockIcon from '../../assets/icons/ClockIcon';
import SettingIconSelected from '../../assets/icons/SettingIconSelected';

const ReviewOrder = ({onPressNext,onPressBack}:any) => {
  const DoctorsNameArray =[
    {
      name:"د. سامي محمد",
      service:"استشارة عن بعد / طبيب عام",
      image:"https://via.placeholder.com/80x80.png?text=Dr+Sami",
      date: "17/06/2025",
      time: "05:00 م",
      duration: "1 ساعة"
    },
    {
      name:"د. أحمد علي",
      service:"استشارة عن بعد / طبيب أطفال",
      image:"https://via.placeholder.com/80x80.png?text=Dr+Ahmed",
      date: "18/06/2025",
      time: "06:00 م",
      duration: "1 ساعة"
    },
    {
      name:"د. فاطمة حسن",
      service:"استشارة عن بعد / طبيب نساء",
      image:"https://via.placeholder.com/80x80.png?text=Dr+Fatima",
      date: "19/06/2025",
      time: "07:00 م",
      duration: "1 ساعة"
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedDoctor = DoctorsNameArray[selectedIndex];

  const renderDoctorTag = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.doctorTag, selectedIndex === index && styles.selectedTag]}
      onPress={() => setSelectedIndex(index)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.doctorImage} />
      <View style={styles.doctorInfoCol}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.serviceName}>{item.service}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={{height:100}}>
        {/* Doctor tags */}
        <FlatList
          data={DoctorsNameArray}
          renderItem={renderDoctorTag}
          keyExtractor={(item, index) => `doctor-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      <ScrollView style={{flex:1}}>
        {/* Details card for selected doctor */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsHeaderText}>الخدمات المختارة (1)</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>✎</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectedServiceRow}>
            <Text style={styles.selectedServiceText}>{selectedDoctor.service}</Text>
            <View style={styles.selectedServiceCircle}><Text style={styles.selectedServiceCircleText}>1</Text></View>
          </View>
          {/* Session info with icons */}
          <View style={styles.sessionInfoDetailsContainer}>
            <View style={styles.sessionInfoDetailItem}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <CalendarIcon width={18} height={18} />
                <Text style={styles.sessionInfoLabel}>تاريخ الجلسة</Text>
              </View>
              <Text style={styles.sessionInfoValue}>{selectedDoctor.date}</Text>
            </View>
            <View style={styles.sessionInfoDetailItem}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <ClockIcon width={18} height={18} />
                <Text style={styles.sessionInfoLabel}>توقيت الجلسة</Text>
              </View>
              <Text style={styles.sessionInfoValue}>{selectedDoctor.time}</Text>
            </View>
            <View style={styles.sessionInfoDetailItem}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <SettingIconSelected width={18} height={18} />
                <Text style={styles.sessionInfoLabel}>المدة</Text>
              </View>
              <Text style={styles.sessionInfoValue}>{selectedDoctor.duration}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onPressBack}>
          <Text style={styles.backButtonText}>رجوع</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={onPressNext}>
          <Text style={styles.nextButtonText}>التالي</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tagsContainer: {
    paddingHorizontal: 8,
    alignItems:'center',
  },
  doctorTag: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 4,
    minWidth: 180,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTag: {
    borderColor: '#23a2a4',
    backgroundColor: 'rgba(35,162,164,0.08)',
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  doctorInfoCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'right',
  },
  serviceName: {
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
  },
  separator: {
    width: 8,
  },
  detailsCard: {
    backgroundColor: '#F6FAF9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    marginBottom: 8,
    backgroundColor:'#e4f1ef',
    paddingHorizontal:10,
    },
  detailsHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    marginBottom: 12,
    borderWidth:1,
    borderColor:'#ddd',
    paddingHorizontal:10,
    paddingVertical:10,
    borderRadius:10,
  },
  selectedServiceCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#23a2a4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedServiceCircleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedServiceText: {
    fontSize: 15,
    color: '#23a2a4',
    fontWeight: 'bold',
  },
  sessionInfoTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'right',
  },
  sessionInfoDetailsContainer: {
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  sessionInfoDetailItem: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  sessionInfoLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
    marginLeft: 2,
  },
  sessionInfoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#179c8e',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#179c8e',
  },
  backButtonText: {
    color: '#179c8e',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewOrder; 