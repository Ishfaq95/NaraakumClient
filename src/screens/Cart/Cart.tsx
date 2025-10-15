import Header from "../../components/common/Header";
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { removeCardItem, clearCardItems, addCardItem, setSelectedUniqueId } from "../../shared/redux/reducers/bookingReducer";
import moment from "moment";
import MinusIcon from "../../assets/icons/MinuesIcon";
import { bookingService, categoriesList } from "../../services/api/BookingService";
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { ROUTES } from "../../shared/utils/routes";
import { globalTextStyles } from "../../styles/globalStyles";
import { convert24HourToArabicTime, generatePayloadforOrderMainBeforePayment, generateUniqueId } from "../../shared/services/service";
import FullScreenLoader from "../../components/FullScreenLoader";
import { convertUTCToLocalDateTime } from "../../utils/timeUtils";

const CartScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const category = useSelector((state: any) => state.root.booking.category);
  const selectedSpecialtyOrService = useSelector((state: any) => state.root.booking.selectedSpecialtyOrService);
  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const getUnPaidUserOrders = async () => {
      try {
        const response = await bookingService.getUnPaidUserOrders({ UserLoginInfoId: user.Id });

        if (response.Cart && response.Cart.length > 0) {
          // Convert API response to cardItems format
          const convertedCardItems = response.Cart;

          // Check for existing items and replace duplicates instead of adding
          const existingCardItems = CardArray;
          const updatedCardItems = [...existingCardItems];

          convertedCardItems.forEach((newItem: any) => {
            // Find if item already exists by OrderDetailId and OrderId
            const existingIndex = updatedCardItems.findIndex((existingItem: any) =>
              existingItem.OrderDetailId === newItem.OrderDetailId &&
              existingItem.OrderId === newItem.OrderId
            );

            if (existingIndex !== -1) {
              const startTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingTime);
              const endTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingEndTime);
              newItem.SchedulingTime = startTime.localTime;
              newItem.SchedulingEndTime = endTime.localTime;
              // Replace existing item with new one
              const newItemObject = {
                ItemUniqueId: generateUniqueId(),
                ...newItem,
              }
              updatedCardItems[existingIndex] = newItemObject;
            } else {
              // Add new item if it doesn't exist
              const startTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingTime);
              const endTime = convertUTCToLocalDateTime(newItem.SchedulingDate, newItem.SchedulingEndTime);
              newItem.SchedulingTime = startTime.localTime;
              newItem.SchedulingEndTime = endTime.localTime;
              const newItemObject = {
                ...newItem,
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
    if (isFocused) {
      getUnPaidUserOrders();
    }
  }, [user, isFocused]);

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('cart')}</Text>
      }
    />
  );

  const handleRemoveItem = async (item: any) => {

    if (item.OrderID && item.OrderDetailId) {
      const payload = {
        "UserLoginInfoId": user.Id,
        "OrderId": item.OrderID,
        "OrderDetailId": item.OrderDetailId,
      }
      const response = await bookingService.deleteOrderMainBeforePayment(payload);
      dispatch(removeCardItem(item));
    } else {
      console.log('item', item);
      dispatch(removeCardItem(item));
    }
  };

  const handleClearAll = () => {
    dispatch(clearCardItems());
  };

  const renderCardItem = ({ item }: { item: any }) => {
    let displayDate = '';
    let displayTime = '';

    if (item.SchedulingDate && item.SchedulingTime) {
      displayDate = moment(item.SchedulingDate).locale('en').format('DD/MM/YYYY');
      displayTime = convert24HourToArabicTime(item.SchedulingTime);
    }

    return (
      <View style={styles.cardItem}>
        {(item?.ServiceProviderUserloginInfoId || item?.OrganizationId) && <View style={styles.cardItemContent}>
          <Text style={styles.providerName}>{String(item?.ServiceProviderFullnameSlang || item?.orgTitleSlang || '')}</Text>
          {(item?.ServiceProviderUserloginInfoId || item?.OrganizationId) && <View style={styles.slotInfoContainer}>
            <Text style={styles.slotInfo}>{displayTime || item?.SchedulingTime}</Text>
            <Text style={styles.dateInfo}>{displayDate || item?.SchedulingDate}</Text>
          </View>}
        </View>}
        <View style={styles.removeButtonContainer}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item)}
          >
            <MinusIcon width={22} height={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.quantityContainer}>
            {item?.CatCategoryId == "42"
              ? <Text style={styles.ServiceText}>{`استشارة عن بعد / ${String(item?.ServiceTitleSlang || item?.TitleSlang || '')}`}</Text>
              : <Text style={styles.ServiceText}>{String(item?.ServiceTitleSlang || item?.TitleSlang || '')}</Text>
            }
            {item?.ServicePrice !== undefined && item?.ServicePrice !== null &&
              <Text style={styles.quantityText}>{`SAR ${String(item.ServicePrice)}`}</Text>
            }
          </View>
        </View>
      </View>
    );
  };

  const createOrderMainBeforePayment = async () => {
    setIsLoading(true);
    const payload = {
      "UserLoginInfoId": user.Id,
      "CatPlatformId": 1,
      "OrderDetail": generatePayloadforOrderMainBeforePayment(CardArray)
    }

    const response = await bookingService.createOrderMainBeforePayment(payload);
    setIsLoading(false);
    if (response.ResponseStatus.STATUSCODE == 200) {
      dispatch(addCardItem([]));
      navigation.navigate(ROUTES.AppNavigator, {
        screen: ROUTES.HomeStack,
        params: {
          screen: ROUTES.BookingScreen,
          params: {
            currentStep: 3,
          }
        }
      });
    } else {
      setIsLoading(false);
    }
  }

  const handleCheckout = () => {
    // let isAPICallNeeded = null;
    let selectedUniqueId = null;

    let isAPICallNeeded = CardArray.find((item: any) => !item.OrderID && !item.OrderDetailId);
    // let selectedUniqueId = selectedItem?.ItemUniqueId;

    CardArray.forEach((cardItem: any) => {
      const displayCategory = categoriesList.find((item: any) => item.Id == cardItem.CatCategoryId);
      let selectedItem: any = displayCategory?.Display == "CP" ? !cardItem.ServiceProviderUserloginInfoId : !cardItem.OrganizationId;
      if (selectedItem) {
        selectedUniqueId = cardItem.ItemUniqueId;
        return;
      }
    });



    if (!isAPICallNeeded && !selectedUniqueId) {
      navigation.navigate(ROUTES.AppNavigator, {
        screen: ROUTES.HomeStack,
        params: {
          screen: ROUTES.BookingScreen,
          params: {
            currentStep: 3,
          }
        }
      });
    } else if (selectedUniqueId) {
      dispatch(setSelectedUniqueId(selectedUniqueId));
      navigation.navigate(ROUTES.AppNavigator, {
        screen: ROUTES.HomeStack,
        params: {
          screen: ROUTES.BookingScreen,
          params: {
            currentStep: 2,
          }
        }
      });
    } else if (isAPICallNeeded) {
      createOrderMainBeforePayment()
    }
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={[globalTextStyles.bodyMedium, { color: '#666' }]}>لا توجد مواعيد محجوزة</Text>
    </View>
  );

  const calculateTotalWithTex = () => {
    let subTotal = 0;
    let tax = 0;
    let total = 0;

    CardArray.forEach((item: any) => {
      if (item.CatNationalityId == "213") {
        subTotal += Number(item.ServicePrice) || 0;
      } else {
        subTotal += (Number(item.ServicePrice) || 0);
        tax += (Number(item.ServicePrice) || 0) * 0.15;
      }
    });

    total = subTotal + tax;
    return {
      subTotal: Number(subTotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.content}>
        {CardArray.length > 0 && (
          <View style={styles.headerActions}>
            <Text style={styles.itemsCount}>الخدمات المختارة ({CardArray.length})</Text>
            <View>
              <Text>{"SAR: " + CardArray.reduce((acc: number, item: any) => acc + (Number(item.ServicePrice) || 0), 0)}</Text>
            </View>
          </View>
        )}
        <FlatList
          data={CardArray}
          renderItem={renderCardItem}
          keyExtractor={(item, idx) => String(item.SrNo || item.OrderDetailId || idx)}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyCart}
        />
        <View style={styles.totalContainer}>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{"إجمالي الخدمات"}</Text>
            <Text style={styles.totalText}>{"SAR: " + calculateTotalWithTex().subTotal}</Text>
          </View>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{"الضريبة (15%)"}</Text>
            <Text style={styles.totalText}>{`SAR: ${calculateTotalWithTex().tax}`}</Text>
          </View>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{"المجموع"}</Text>
            <Text style={styles.totalText}>{`SAR: ${calculateTotalWithTex().total}`}</Text>
          </View>

        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity style={[styles.checkoutButton, { width: '56%' }]} onPress={() => {
            navigation.navigate(ROUTES.AppNavigator, {
              screen: ROUTES.HomeStack,
              params: {
                screen: ROUTES.Services
              }
            });
          }}>
            <Text numberOfLines={1} style={styles.checkoutButtonText}>{"إضافة مزيد من الخدمات"}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={CardArray.length == 0} style={[styles.checkoutButton, { width: '40%' }, CardArray.length == 0 && { backgroundColor: '#ccc' }]} onPress={() => {
            handleCheckout();
          }}>
            <Text style={styles.checkoutButtonText}>{"إتمام الدفع"}</Text>
          </TouchableOpacity>

        </View>
      </View>

      <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    ...globalTextStyles.h3,
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  itemsCount: {
    ...globalTextStyles.bodyMedium,
    fontFamily: globalTextStyles.h5.fontFamily,
    color: '#333',
  },
  clearAllButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearAllButtonText: {
    ...globalTextStyles.bodySmall,
    color: '#FFFFFF',
    fontFamily: globalTextStyles.h5.fontFamily,
  },
  listContainer: {
    flexGrow: 1,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    width: '100%',
    backgroundColor: '#e4f1ef',
    paddingHorizontal: 10,
  },
  slotInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    gap: 10,
  },
  providerName: {
    ...globalTextStyles.bodyMedium,
    fontFamily: globalTextStyles.h5.fontFamily,
    color: '#333',
    marginBottom: 4,
  },
  slotInfo: {
    ...globalTextStyles.bodySmall,
    color: '#666',
    marginBottom: 2,
  },
  dateInfo: {
    ...globalTextStyles.bodySmall,
    color: '#666',
  },
  removeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    gap: 10,
  },
  removeButton: {
    backgroundColor: 'red',
    borderRadius: 100,
    height: 22,
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    ...globalTextStyles.caption,
    color: '#FFFFFF',
    fontFamily: globalTextStyles.h5.fontFamily,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    ...globalTextStyles.bodyMedium,
    color: '#666',
    textAlign: 'center',
  },
  quantityContainer: {
    gap: 10,
    width: '90%',
  },
  ServiceText: {
    ...globalTextStyles.bodyMedium,
    color: '#666',
  },
  quantityText: {
    ...globalTextStyles.bodyMedium,
    fontFamily: globalTextStyles.h5.fontFamily,
    color: '#23a2a4',
    textAlign: 'left',
  },
  totalContainer: {
    backgroundColor: "#e4f1ef",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  totalTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    ...globalTextStyles.bodyMedium,
  },
  checkoutButton: {
    backgroundColor: '#23a2a4',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: '48%',
  },
  checkoutButtonText: {
    ...globalTextStyles.buttonMedium,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CartScreen;