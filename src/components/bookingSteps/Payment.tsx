import CustomSwitch from '../../components/common/CustomSwitch';
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { bookingService } from '../../services/api/BookingService';
import { useTranslation } from 'react-i18next';
import { addCardItem } from '../../shared/redux/reducers/bookingReducer';
import { generatePayloadForCheckOut } from '../../shared/services/service';

const Payment = ({ onPressNext, onPressBack }: any) => {
  const { t } = useTranslation();
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const user = useSelector((state: any) => state.root.user.user);
  const [enabled, setEnabled] = useState(false);
  const [wallet, setWallet] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    const getUnPaidUserOrders = async () => {
      try {
        const response = await bookingService.getUnPaidUserOrders({ UserLoginInfoId: user.Id });

        if (response.Cart && response.Cart.length > 0) {
          // Convert API response to cardItems format
          const convertedCardItems = response.Cart;

          // Check for existing items and replace duplicates instead of adding
          const existingCardItems: any[] = [];
          const updatedCardItems = [...existingCardItems];

          convertedCardItems.forEach((newItem: any) => {
            // Find if item already exists by OrderDetailId and OrderId
            const existingIndex = updatedCardItems.findIndex((existingItem: any) =>
              existingItem.OrderDetailId === newItem.OrderDetailId &&
              existingItem.OrderId === newItem.OrderId
            );

            if (existingIndex !== -1) {
              const newItemObject = {
                ...newItem,
                PatientUserProfileInfoId: user.UserProfileInfoId,
                TextDescription: "",
              }
              // Replace existing item with new one
              updatedCardItems[existingIndex] = newItemObject;
            } else {
              // Add new item if it doesn't exist
              const newItemObject = {
                ...newItem,
                PatientUserProfileInfoId: user.UserProfileInfoId,
                TextDescription: "",
              }
              updatedCardItems.push(newItemObject);
            }
          });

          // Dispatch the updated array
          dispatch(addCardItem(updatedCardItems));
        }
      } catch (error) {
        console.error('Error fetching unpaid orders:', error);
      }
    }
    getUnPaidUserOrders();
  }, [user]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user?.Id) return;
      setLoading(true);
      try {
        const res = await bookingService.getUpdatedWallet({ UserLoginInfoId: user.Id });


        if (res?.ResponseStatus.STATUSCODE === 200) {
          setWallet(res?.Wallet[0]?.TotalAmount ?? 0);
        } else {
          setWallet(null);
        }
      } catch (e) {
        setWallet(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [user]);

  const handleNext = async () => {
    const payload = {
      "UserLoginInfoId": user.Id,
      "OrderId": CardArray[0].OrderID,
      "NetAmountRecieved": CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0),
      "TransactionId": "NK" + Date.now().toString(),
      "Currency": "682",
      "Language": "Ar",
      "MerchantIdentifier": "1000004407",
      "PaymentOption": "Card",
      "MerchantStatus": "Pending",
      "SecureHash": "44fcc9371621f0ea10e0eba928df2cacc823b6ee504a48ed70e5ea6a56bfa80f",
      "CardType": 1,
      "CatPlatformId": 1,
      "BookingFromWallet": 1,
      "OrderDetail": generatePayloadForCheckOut(CardArray)
    }

    const response = await bookingService.updateOrderMainToCheckOut(payload);
    
    onPressNext(response);
  };

  const handleBack = () => {
    onPressBack();
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>المبلغ الإجمالي</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#23a2a4' }}>{`SAR ${CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0)}`}</Text>
      </View>

      <View style={{ flexDirection: 'row', width: "100%", justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, backgroundColor: "#eff5f5", paddingHorizontal: 16 }}>
        <View style={{ alignItems: "flex-start" }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>استخدم رصيد المحفظة :</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{`SAR ${wallet?.toFixed(2)}`}</Text>
        </View>
        <View style={{}}>
          <CustomSwitch value={enabled} onValueChange={setEnabled} />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.BottomContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, styles.disabledNextButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  backButton: {
    width: "34%",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#179c8e',
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    width: "64%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
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
  BottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  disabledNextButton: {
    opacity: 0.5,
  },
})

export default Payment; 