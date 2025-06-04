import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  Image,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import Person from '../../assets/icons/Person';
import CallIcon from '../../assets/icons/CallIcon';
import CheckIcon from '../../assets/icons/CheckIcon';
import Participants from '../../assets/icons/Participants';
import Svg, { Path } from 'react-native-svg';

// Inline SVG for Calendar
const CalendarIcon = ({ width = 18, height = 18, color = '#008080' }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
    <path d="M16 3v4M8 3v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3 9h18" stroke={color} strokeWidth="2" />
  </svg>
);

// Inline SVG for Clock
const ClockIcon = ({ width = 18, height = 18, color = '#008080' }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Replace the SVG components with react-native-svg components
const LeftArrow = ({ width = 24, height = 24, color = '#008080' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RightArrow = ({ width = 24, height = 24, color = '#008080' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface AppointmentCardProps {
  appointment: any;
  onJoinMeeting: (meetingId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onJoinMeeting }) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = React.useState(0);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return moment.utc(dateString).local().format('DD/MM/YYYY');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      // If timeString is in ISO format
      if (timeString.includes('T')) {
        return moment.utc(timeString).local().format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
      }
      
      // If timeString is just time (HH:mm)
      const [hours, minutes] = timeString.split(':');
      const date = moment.utc().set({ hours: parseInt(hours), minutes: parseInt(minutes) });
      return date.local().format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    const scrollAmount = 120; // Width of approximately 2 tags
    
    if (isRTL) {
      // In RTL, left button should scroll left and right button should scroll right
      const newOffset = direction === 'left' 
        ? scrollPosition + scrollAmount 
        : scrollPosition - scrollAmount;
      scrollViewRef.current?.scrollTo({ x: newOffset, animated: true });
    } else {
      const newOffset = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      scrollViewRef.current?.scrollTo({ x: newOffset, animated: true });
    }
  };

  const getStatusStyle = (statusId: string | number) => {
    // Convert statusId to number if it's a string
    const numericStatusId = typeof statusId === 'string' ? parseInt(statusId, 10) : statusId;

    switch (numericStatusId) {
      case 1:
        return {
          backgroundColor: '#edfbfe',
          borderColor: '#50c8e1',
          text: t('تم حجز الخدمة')
        };
      case 17:
        return {
          backgroundColor: '#edfbfe',
          borderColor: '#50c8e1',
          text: t('قبول الطلب')
        };
      case 7:
        return {
          backgroundColor: '#fef6e2',
          borderColor: '#ffde7a',
          text: t('الممارس الصحي في طريقه اليك')
        };
      case 8:
        return {
          backgroundColor: '#d2f9cd',
          borderColor: '#2ab318',
          text: t('تم تلقي الخدمة')
        };
      case 10:
        return {
          backgroundColor: '#d2f9cd',
          borderColor: '#2ab318',
          text: t('اكتملت الخدمة')
        };
      case 24:
        return {
          backgroundColor: '#ececec',
          borderColor: '#838a98',
          text: t('فاتت')
        };
      default:
        return {
          backgroundColor: '#edfbfe',
          borderColor: '#50c8e1',
          text: t('قبول الطلب')
        };
    }
  };

  return (
    <View style={styles.card}>
      {/* Doctor Info */}
      <View style={styles.headerRow}>
        <View style={styles.avatarPlaceholder}>
          <Person width={32} height={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {isRTL ? appointment?.ServiceProviderSName : appointment?.ServiceProviderPName}
          </Text>
          <View style={styles.specialtiesContainer}>
            <TouchableOpacity 
              onPress={() => scrollByAmount('left')} 
              style={styles.scrollButton}
            >
              {isRTL ? <RightArrow /> : <LeftArrow />}
            </TouchableOpacity>
            
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.specialtiesScrollView}
              onScroll={(event) => {
                setScrollPosition(event.nativeEvent.contentOffset.x);
              }}
              scrollEventThrottle={16}
            >
              <View style={styles.specialtiesRow}>
                {(appointment?.Specialties || []).map((spec: any, idx: number) => (
                  <View key={idx} style={styles.specialtyPill}>
                    <Text style={styles.specialtyText}>
                      {isRTL ? spec.TitleSlang : spec.TitlePlang}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity 
              onPress={() => scrollByAmount('right')} 
              style={styles.scrollButton}
            >
              {isRTL ? <LeftArrow /> : <RightArrow />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Visit Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('تاريخ الزيارة')}</Text>
          <Text style={styles.detailValue}>
            {formatDate(appointment?.SchedulingDate)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('موعد الزيارة')}</Text>
          <Text style={styles.detailValue}>
            {formatTime(appointment?.SchedulingTime)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>{t('الحالة')}</Text>
          <View style={[
            styles.statusContainer,
            {
              backgroundColor: getStatusStyle(appointment?.CatOrderStatusId).backgroundColor,
              borderLeftColor: getStatusStyle(appointment?.CatOrderStatusId).borderColor
            }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusStyle(appointment?.CatOrderStatusId).borderColor }
            ]}>
              {getStatusStyle(appointment?.CatOrderStatusId).text}
            </Text>
          </View>
        </View>
      </View>

      {/* Info Bar (not a button) */}
      <View style={styles.infoBar}>
        <Participants width={20} height={20} />
        <Text style={styles.infoBarText}>
          {t('استشارة عن بعد 30 دقيقة / طبيب عام')}
        </Text>
      </View>

      {/* Disabled Call Button */}
      <TouchableOpacity
        style={[styles.callBtn, styles.callBtnDisabled]}
        disabled={true}
      >
        <CallIcon width={20} height={20} color="#bdbdbd" />
        <Text style={styles.callBtnText}>{t('بدء الاتصال')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    textAlign: 'right',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialtiesScrollView: {
    flex: 1,
  },
  specialtiesRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  specialtyPill: {
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 2,
    marginBottom: 2,
  },
  specialtyText: {
    fontSize: 12,
    color: '#222',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  detailsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  detailValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    textAlign: 'left',
  },
  statusContainer: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoBar: {
    backgroundColor: '#222',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },
  infoBarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  callBtn: {
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'center',
    opacity: 1,
  },
  callBtnDisabled: {
    opacity: 0.5,
  },
  callBtnText: {
    color: '#bdbdbd',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AppointmentCard; 