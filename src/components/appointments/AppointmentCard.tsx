import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Person from '../../assets/icons/Person';
import CallIcon from '../../assets/icons/CallIcon';
import CheckIcon from '../../assets/icons/CheckIcon';
import Participants from '../../assets/icons/Participants';

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

interface AppointmentCardProps {
  appointment: any;
  onJoinMeeting: (meetingId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onJoinMeeting }) => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  // Example specialties array from appointment object
  const specialties = appointment.Specialties || [];

  return (
    <View style={styles.card}>
      {/* Doctor Info */}
      <View style={styles.headerRow}>
        <View style={styles.avatarPlaceholder}>
          <Person width={32} height={32} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {isRTL ? appointment.ServiceProviderSName : appointment.ServiceProviderPName}
          </Text>
          <View style={styles.specialtiesRow}>
            {(appointment.Specialties || []).map((spec: string, idx: number) => (
              <View key={idx} style={styles.specialtyPill}>
                <Text style={styles.specialtyText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Visit Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <CalendarIcon />
          <Text style={styles.detailLabel}>{t('تاريخ الزيارة')}</Text>
          <Text style={styles.detailValue}>{appointment.SchedulingDate}</Text>
        </View>
        <View style={styles.detailItem}>
          <ClockIcon />
          <Text style={styles.detailLabel}>{t('موعد الزيارة')}</Text>
          <Text style={styles.detailValue}>{appointment.SchedulingTime}</Text>
        </View>
        <View style={styles.detailItem}>
          <CheckIcon color="#008080" width={18} height={18} />
          <Text style={styles.detailLabel}>{t('الحالة')}</Text>
          <Text style={styles.detailValue}>{appointment.StatusText || t('قبول الطلب')}</Text>
        </View>
      </View>

      {/* Accept Button */}
      <TouchableOpacity style={styles.acceptBtn}>
        <Text style={styles.acceptBtnText}>{t('قبول الطلب')}</Text>
      </TouchableOpacity>

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
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
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
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    marginTop: 2,
  },
  acceptBtn: {
    backgroundColor: '#e0f7fa',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#008080',
    width: 120,
    alignSelf: 'flex-start',
  },
  acceptBtnText: {
    color: '#008080',
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