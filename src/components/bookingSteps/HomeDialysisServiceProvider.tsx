import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import UserPlaceholder from '../../assets/icons/UserPlaceholder';
import { MediaBaseURL } from '../../shared/utils/constants';
import LeftArrow from '../../assets/icons/LeftArrow';
import RightArrow from '../../assets/icons/RightArrow';
import { generateSlotsForDate } from '../../utils/timeUtils';
import CheckIcon from '../../assets/icons/CheckIcon';
import { useSelector, useDispatch } from 'react-redux';
import { addCardItem, addHomeDialysisCardItem, manageTempSlotDetail } from '../../shared/redux/reducers/bookingReducer';

const HomeDialysisServiceProvider: React.FC<any> = React.memo(({
    provider,
    onTimeSelect,
    selectedDate,
    availability,
    selectedSlotInfo,
    onSelectSlot,
    onSelectService,
    selectedService
}) => {
    const dispatch = useDispatch();
    const CardArray = useSelector((state: any) => state.root.booking.homeDialysisCardItems);
    const services = useSelector((state: any) => state.root.booking.services);
    const location = useSelector((state: any) => state.root.booking.selectedLocation);
    const tempSlotDetail = useSelector((state: any) => state.root.booking.tempSlotDetail);
    const selectedUniqueId = useSelector((state: any) => state.root.booking.selectedUniqueId);
    const category = useSelector((state: any) => state.root.booking.category);


    const [specialtiesScrollPosition, setSpecialtiesScrollPosition] = useState(0);
    const [timeSlotsScrollPosition, setTimeSlotsScrollPosition] = useState(0);
    const [timeSlots, setTimeSlots] = useState<any[]>([]);

    const specialtiesScrollViewRef = useRef<ScrollView>(null);
    const timeSlotsScrollViewRef = useRef<ScrollView>(null);
    const isRTL = true;

    const isPastTime = useCallback((slot: any) => {
        // Only check past times if the selected date is today
        const today = new Date();
        const selectedDateObj = new Date(selectedDate.format('YYYY-MM-DD'));

        // If selected date is not today, all slots are available
        if (selectedDateObj.toDateString() !== today.toDateString()) {
            return false;
        }

        const inputTime = slot.fullTime;

        // Get current time
        const now = new Date();
        const slotTime = new Date();
        const [inputHours, inputMinutes] = inputTime.split(':').map(Number);

        // Set the time of slot date to match the input
        slotTime.setHours(inputHours);
        slotTime.setMinutes(inputMinutes);
        slotTime.setSeconds(0);
        slotTime.setMilliseconds(0);

        return slotTime < now;
    }, [selectedDate]);

    useEffect(() => {
        if (timeSlots.length > 0) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            // Find the next available slot after current time
            const nextSlotIndex = timeSlots.findIndex(slot => {
                const [slotHour, slotMinute] = slot.fullTime.split(':').map(Number);
                const [currentHour, currentMinute] = currentTime.split(':').map(Number);

                // Convert to minutes for easier comparison
                const slotTimeInMinutes = slotHour * 60 + slotMinute;
                const currentTimeInMinutes = currentHour * 60 + currentMinute;

                return slotTimeInMinutes > currentTimeInMinutes && slot.available;
            });

            setTimeout(() => {
                if (timeSlotsScrollViewRef.current) {
                    if (timeSlotsScrollViewRef.current) {
                        const slotWidth = 104;
                        const scrollAmount = slotWidth * nextSlotIndex / 2;
                        const currentPosition = timeSlotsScrollPosition;
                        const newPosition = true
                            ? Math.max(0, currentPosition - scrollAmount)
                            : currentPosition + scrollAmount;

                        requestAnimationFrame(() => {
                            timeSlotsScrollViewRef.current?.scrollTo({
                                x: newPosition,
                                animated: true
                            });
                        });
                    }
                }
            }, 1000);
        }
    }, [timeSlots]);

    // Memoize static content to prevent unnecessary re-renders
    const providerInfo = useMemo(() => (
        <>
            <View style={[{ flexDirection: 'row', width: '100%' }, selectedSlotInfo?.providerId === provider.UserId && styles.selectedProviderCard]}>
                {selectedSlotInfo?.providerId === provider.UserId && <View style={{ position: 'absolute', right: 10, bottom: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <CheckIcon width={40} height={40} color="#fff" />
                </View>}
                <View style={{ width: '30%' }}>
                    {provider.ImagePath ? (
                        <Image
                            source={{ uri: `${MediaBaseURL}/${provider.ImagePath}` }}
                            style={styles.providerImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <UserPlaceholder width={80} height={80} />
                    )}
                </View>
                <View style={{ width: '70%' }}>
                    <Text style={styles.providerName}>{provider.FullnameSlang}</Text>
                    <View style={{ flexDirection: 'row', marginVertical: 2 }}>
                        <Text style={styles.ratingText}>{provider.AccumulativeRatingAvg.toFixed(1)}</Text>
                        <Text style={{ color: '#888', fontSize: 12 }}> ({provider.AccumulativeRatingNum} تقييم)</Text>
                        <Text style={{ color: '#FFD700', marginLeft: 2 }}>★</Text>
                    </View>
                </View>
            </View>
        </>
    ), [provider, selectedSlotInfo, selectedService]);

    const specialtiesSection = useMemo(() => (
        <View style={styles.specialtyContainer}>
            <TouchableOpacity
                onPress={() => scrollSpecialties('left')}
                style={[styles.scrollButton, styles.leftScrollButton]}
                activeOpacity={0.7}
            >
                {isRTL ? <RightArrow /> : <LeftArrow />}
            </TouchableOpacity>

            <ScrollView
                ref={specialtiesScrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.specialtiesScrollView}
                onScroll={(event) => setSpecialtiesScrollPosition(event.nativeEvent.contentOffset.x)}
                scrollEventThrottle={16}
                decelerationRate={0}
                contentContainerStyle={styles.specialtiesContent}
            >
                <View style={styles.specialtiesRow}>
                    {provider?.Specialties?.map((spec: any, index: any) => (
                        <View key={`${spec.CatSpecialtyId}-${spec.UserloginInfoId}-${index}`} style={styles.specialtyPill}>
                            <Text style={styles.specialtyText}>
                                {isRTL ? spec.TitleSlang : spec.TitlePlang}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                onPress={() => scrollSpecialties('right')}
                style={[styles.scrollButton, styles.rightScrollButton]}
                activeOpacity={0.7}
            >
                {isRTL ? <LeftArrow /> : <RightArrow />}
            </TouchableOpacity>
        </View>
    ), [provider.Specialties]);

    const scrollSpecialties = (direction: 'left' | 'right') => {
        if (specialtiesScrollViewRef.current) {
            const scrollAmount = 100;
            const currentPosition = specialtiesScrollPosition;
            const newPosition = direction === 'right'
                ? Math.max(0, currentPosition - scrollAmount)
                : currentPosition + scrollAmount;

            requestAnimationFrame(() => {
                specialtiesScrollViewRef.current?.scrollTo({
                    x: newPosition,
                    animated: true
                });
            });
        }
    };

    const scrollTimeSlots = useCallback((direction: 'left' | 'right') => {
        if (timeSlotsScrollViewRef.current) {
            const scrollAmount = 120;
            const currentPosition = timeSlotsScrollPosition;
            const newPosition = direction === 'left'
                ? Math.max(0, currentPosition - scrollAmount)
                : currentPosition + scrollAmount;

            timeSlotsScrollViewRef.current.scrollTo({
                x: newPosition,
                animated: true
            });
        }
    }, [timeSlotsScrollPosition]);

    const handleSlotSelect = useCallback((time: any) => {
        onSelectSlot(provider, time);

        const tempCardArray = [...CardArray];

        provider.ServiceServe.map((item: any) => {
            const Obj = {
                "OrderDetailId":0,
                "OrganizationId":provider.OrganizationId,
                "CatCategoryId":category.Id,
                "CatServiceId":item.Id,
                "CatCategoryTypeId":item.CatServiceServeTypeId,
                "OrganizationServiceId":provider.OrganizationServiceIds.split(',')[0],
                "ServiceCharges":item.Price,
                "ServiceProviderloginInfoId":provider.UserId,
                "CatSpecialtyId":0,
                "OrganizationSpecialtiesId":0,
                "OrganizationPackageId":0,
                "Quantity":1,
                "SchedulingDate":selectedDate.format('YYYY-MM-DD'),
                "SchedulingTime":time.start_time,
                "CatSchedulingAvailabilityTypeId":availability[0].CatAvailabilityTypeId,
                "OrderAddress":location.address,
                "OrderAddressGoogleLocation":location.latitude + "," + location.longitude,
                "saveinAddress":false,
                "AvailabilityId": availability[0].Id,
            }

            tempCardArray.push(Obj);
        })
        
        dispatch(addHomeDialysisCardItem(tempCardArray));

    }, [provider, onSelectSlot, CardArray, selectedService, services, selectedDate, availability, dispatch]);

    const renderTimeSlots = useMemo(() => {
        return (
            <View style={styles.specialtyContainer}>
                {/* <TouchableOpacity
          onPress={() => scrollTimeSlots('left')}
          style={[styles.scrollButton, styles.leftScrollButton]}
          activeOpacity={0.7}
        >
          {isRTL ? <RightArrow /> : <LeftArrow />}
        </TouchableOpacity>

        <ScrollView
          ref={timeSlotsScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.specialtiesScrollView}
          onScroll={(event) => setTimeSlotsScrollPosition(event.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          snapToInterval={120}
          decelerationRate={0}
          snapToAlignment="start"
          contentContainerStyle={styles.timeSlotsContent}
        > */}
                <View style={styles.specialtiesRow}>
                    {provider.slots && provider.slots.map((slot: any, index: any) => {
                        const isSelected = selectedSlotInfo?.providerId === provider.UserId &&
                            selectedSlotInfo?.slotTime === slot.start_time;
                        const isPast = isPastTime(slot);
                        const isDisabled = !slot.available || isPast;

                        return (
                            <TouchableOpacity
                                key={`time-${slot.start_time}-${index}`}
                                style={[
                                    styles.timeButton,
                                    isSelected && styles.selectedTimeButton,
                                    isDisabled && styles.disabledTimeButton
                                ]}
                                onPress={() => !isDisabled && handleSlotSelect(slot)}
                                activeOpacity={0.5}
                                disabled={isDisabled}
                            >
                                <Text style={[
                                    styles.timeButtonText,
                                    isSelected && styles.selectedTimeButtonText,
                                    isDisabled && styles.disabledTimeButtonText
                                ]}>{slot.start_time}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {/* </ScrollView>

        <TouchableOpacity
          onPress={() => scrollTimeSlots('right')}
          style={[styles.scrollButton, styles.rightScrollButton]}
          activeOpacity={0.7}
        >
          {isRTL ? <LeftArrow /> : <RightArrow />}
        </TouchableOpacity> */}
            </View>
        );
    }, [provider.slots, selectedSlotInfo, provider.UserId, isPastTime, handleSlotSelect, scrollTimeSlots]);

    return (
        <View style={[styles.providerCard]}>
            {providerInfo}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, width: '100%' }}>
                <Text style={styles.videoInfo}>استشارة طبية فيديو :</Text>
                <Text style={{ color: '#179c8e' }}>{provider.SlotDuration} دقيقة</Text>

            </View>
            <View style={styles.divider} />
            <View style={{ width: '100%', alignItems: 'flex-start' }}>
                <Text style={styles.selectTimeLabel}>اختر توقيت الزيارة</Text>
            </View>

            {renderTimeSlots}
        </View>
    );
});

const styles = StyleSheet.create({
    providerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        alignItems: 'center',
        position: 'relative',
    },
    favoriteIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 2,
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
    priceText: {
        color: '#179c8e',
        fontWeight: '600',
        fontSize: 16,
        marginVertical: 4,
    },
    specialtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        width: '100%',
    },
    scrollButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        minWidth: 40,
    },
    leftScrollButton: {
        marginRight: 4,
    },
    rightScrollButton: {
        marginLeft: 4,
    },
    specialtiesScrollView: {
        flex: 1,
    },
    specialtiesContent: {
        paddingHorizontal: 8,
    },
    specialtiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    specialtyPill: {
        backgroundColor: '#f7f7f7',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
    },
    specialtyText: {
        color: '#222',
        fontSize: 12,
    },
    videoInfo: {
        color: '#888',
        fontSize: 13,
        marginVertical: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '100%',
        marginVertical: 8,
    },
    selectTimeLabel: {
        color: '#888',
        fontSize: 13,
        marginBottom: 4,
    },
    timeButton: {
        borderWidth: 1,
        borderColor: '#179c8e',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 4,
        backgroundColor: '#fff',
        width: 100,
    },
    disabledTimeButton: {
        borderColor: '#ccc',
        backgroundColor: '#f5f5f5',
    },
    timeButtonText: {
        color: '#179c8e',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    disabledTimeButtonText: {
        color: '#999',
    },
    timeSlotsContent: {
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        width: '100%',
    },
    loadingText: {
        marginLeft: 8,
        color: '#179c8e',
        fontSize: 14,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        width: '100%',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    retryButton: {
        backgroundColor: '#179c8e',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    noSlotsContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        width: '100%',
    },
    noSlotsText: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#008080',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedBox: {
        backgroundColor: '#008080',
    },
    selectedProviderCard: {
        backgroundColor: 'rgba(35, 162, 164, .4)',
    },
    selectedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#179c8e',
        borderRadius: 8,
        marginTop: 8,
    },
    selectedIndicatorText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    selectedTimeButton: {
        backgroundColor: '#179c8e',
    },
    selectedTimeButtonText: {
        color: '#fff',
    },
});

export default HomeDialysisServiceProvider;