import React, { useRef, useMemo, useEffect, useState } from 'react';
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
import CalendarIcon from '../../assets/icons/CalendarIcon';
import ClockIcon from '../../assets/icons/ClockIcon';
import LeftArrow from '../../assets/icons/LeftArrow';
import RightArrow from '../../assets/icons/RightArrow';
import { BaseURL, MediaBaseURL } from '../../shared/utils/constants';
import { formatDate, formatTime, getDuration, getStatusStyle } from '../../shared/services/service';
import SettingIconSelected from '../../assets/icons/SettingIconSelected';
import { globalTextStyles } from '../../styles/globalStyles';
import Entypo from 'react-native-vector-icons/Entypo';

interface AppointmentCardProps {
    appointment: any;
    onJoinMeeting: (appointment: any) => void;
    isCallEnabled: boolean;
    onPrescription: (appointment: any) => void;
    onNewAppointment: (appointment: any) => void;
    onRating: (appointment: any) => void;
    onMoreIcon: (appointment: any) => void;
}

const RemoteAppointmentCard: React.FC<AppointmentCardProps> = React.memo(({
    appointment,
    onJoinMeeting,
    isCallEnabled,
    onPrescription,
    onNewAppointment,
    onRating,
    onMoreIcon
}) => {
    const { t } = useTranslation();
    const isRTL = I18nManager.isRTL;
    const scrollViewRef = useRef<ScrollView>(null);
    const [scrollPosition, setScrollPosition] = React.useState(0);

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

    return (
        <View style={styles.card}>
            {/* Doctor Info */}
            <View style={styles.headerRow}>
                <View style={styles.avatarPlaceholder}>
                    {appointment.ImagePath ? <Image source={{ uri: `${MediaBaseURL}/${appointment.ImagePath}` }} style={styles.avatarImage} /> : <Person width={32} height={32} />}
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.doctorName} numberOfLines={1}>
                            {appointment?.ServiceProviderSName}
                        </Text>
                        <TouchableOpacity style={{ height: 35, width: 30, backgroundColor: '#23A2A4', borderRadius: 15, alignItems: 'center', justifyContent: 'center' }} onPress={() => onMoreIcon(appointment)}>
                            <Entypo name="dots-three-vertical" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <CalendarIcon />
                        <Text style={styles.detailLabel}>{t('تاريخ الزيارة')}</Text>
                    </View>

                    <Text style={styles.detailValue}>
                        {formatDate(appointment?.SchedulingDate)}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ClockIcon />
                        <Text style={styles.detailLabel}>{t('موعد الزيارة')}</Text>
                    </View>
                    <Text style={styles.detailValue}>
                        {formatTime(appointment?.SchedulingTime)}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <SettingIconSelected width={20} height={20} />
                        <Text style={styles.detailLabel}>{t('الحالة')}</Text>
                    </View>
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
                    {/* {t('استشارة عن بعد 30 دقيقة / طبيب عام')} */}
                    {`${appointment?.TitleSlangCategory} ${getDuration(appointment)} / ${appointment?.TitleSlangSpecialty || appointment?.TitleSlangService}`}
                </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {/* Call Button */}
                <TouchableOpacity
                    style={[
                        styles.callBtn,
                        isCallEnabled ? styles.callBtnEnabled : styles.callBtnDisabled
                    ]}
                    disabled={false}
                    onPress={() => onJoinMeeting(appointment)}
                >
                    <CallIcon
                        width={20}
                        height={20}
                        color={isCallEnabled ? '#fff' : '#bdbdbd'}
                    />
                    <Text numberOfLines={1} style={[
                        styles.callBtnText,
                        isCallEnabled && styles.callBtnTextEnabled
                    ]}>
                        {t('بدء الاتصال')}
                    </Text>
                </TouchableOpacity>

                {/* prescription */}
                <TouchableOpacity
                    style={[
                        styles.callBtn,
                        { backgroundColor: appointment?.VisitMainId ? '#fff' : '#f2f2f2', borderWidth: 1, borderColor: appointment?.VisitMainId ? '#23a2a4' : '#bdbdbd' }
                    ]}
                    disabled={appointment?.VisitMainId ? false : true}
                    onPress={() => onPrescription(appointment)}
                >
                    <Text numberOfLines={1} style={[
                        styles.callBtnText,
                        { color: appointment?.VisitMainId ? '#23a2a4' : '#bdbdbd' }
                    ]}>
                        {'الوصفة الطبية'}
                    </Text>
                </TouchableOpacity>
            </View>


            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {/* Call Button */}
                <TouchableOpacity
                    style={[
                        styles.callBtn,
                        { backgroundColor: '#fff', borderWidth: 1, borderColor: '#23a2a4' }
                    ]}
                    disabled={false}
                    onPress={() => onNewAppointment(appointment)}
                >
                    <Text numberOfLines={1} style={[
                        styles.callBtnText,
                        { color: '#23a2a4' }
                    ]}>
                        {'حجز موعد جديد'}
                    </Text>
                </TouchableOpacity>

                {/* Call Button */}
                <TouchableOpacity
                    style={[
                        styles.callBtn,
                        { backgroundColor: '#fff', borderWidth: 1, borderColor: '#23a2a4' }
                    ]}
                    onPress={() => onRating(appointment)}
                >
                    <Entypo name="star" size={24} color="#f8c733" />
                    <Text numberOfLines={1} style={[
                        styles.callBtnText,
                        { color: '#23a2a4' }
                    ]}>
                        {'تقييم مقدم الخدمة'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

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
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    doctorName: {
        ...globalTextStyles.bodyMedium,
        fontFamily: globalTextStyles.h5.fontFamily,
        color: '#222',
        marginBottom: 4,
        textAlign: 'left',
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
        ...globalTextStyles.caption,
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
        ...globalTextStyles.bodySmall,
        color: '#666',
        textAlign: 'right',
        marginLeft: 8,
    },
    detailValue: {
        ...globalTextStyles.bodySmall,
        color: '#222',
        fontFamily: globalTextStyles.h5.fontFamily,
        textAlign: 'left',
    },
    statusContainer: {
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderLeftWidth: 4,
    },
    statusText: {
        ...globalTextStyles.bodySmall,
        fontFamily: globalTextStyles.h5.fontFamily,
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
        ...globalTextStyles.bodySmall,
        color: '#fff',
        fontFamily: globalTextStyles.h5.fontFamily,
        marginLeft: 8,
    },
    callBtn: {
        width: '48%',
        backgroundColor: '#f2f2f2',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        justifyContent: 'center',
        marginBottom: 10,
    },
    callBtnEnabled: {
        backgroundColor: '#19b123',
        borderWidth: 1,
        borderColor: '#19b123',
    },
    callBtnDisabled: {
        opacity: 0.5,
    },
    callBtnText: {
        ...globalTextStyles.buttonMedium,
        color: '#bdbdbd',
        marginLeft: 8,
    },
    callBtnTextEnabled: {
        color: '#fff',
    },
});

export default RemoteAppointmentCard; 