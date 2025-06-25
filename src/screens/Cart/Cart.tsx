import Header from "../../components/common/Header";
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { removeCardItem, clearCardItems, addCardItem } from "../../shared/redux/reducers/bookingReducer";
import moment from "moment";
import MinusIcon from "../../assets/icons/MinuesIcon";
import { bookingService } from "../../services/api/BookingService";
import { useEffect } from "react";

const CartScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const category = useSelector((state: any) => state.root.booking.category);
  const selectedSpecialtyOrService = useSelector((state: any) => state.root.booking.selectedSpecialtyOrService);
  const user = useSelector((state: any) => state.root.user.user);
  const CardArray = useSelector((state: any) => state.root.booking.cardItems);


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
              // Replace existing item with new one
              const newItemObject = {
                SrNo: Math.floor(Math.random() * 10000),
                ...newItem,
              }
              updatedCardItems[existingIndex] = newItemObject;
            } else {
              // Add new item if it doesn't exist
              const newItemObject = {
                SrNo: Math.floor(Math.random() * 10000),
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
    getUnPaidUserOrders();
  }, [user]);

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
      dispatch(removeCardItem(item.SrNo));
    } else {
      dispatch(removeCardItem(item.SrNo));
    }
  };

  const handleClearAll = () => {
    dispatch(clearCardItems());
  };

  const renderCardItem = ({ item }: { item: any }) => {
    let displayDate = '';
    let displayTime = '';

    if (item.SchedulingDate && item.SchedulingTime) {
      const datePart = item.SchedulingDate.split('T')[0];
      const utcDateTime = moment.utc(`${datePart}T${item.SchedulingTime}:00Z`);
      if (utcDateTime.isValid()) {
        const localDateTime = utcDateTime.local();
        displayDate = localDateTime.format('DD/MM/YYYY');
        displayTime = localDateTime.format('hh:mm A').replace('AM', 'ص').replace('PM', 'م');
      }
    }

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardItemContent}>
          <Text style={styles.providerName}>{String(item?.ServiceProviderFullnameSlang || '')}</Text>
          {item?.ServiceProviderUserloginInfoId && <View style={styles.slotInfoContainer}>
            <Text style={styles.slotInfo}>{displayTime || item?.SchedulingTime}</Text>
            <Text style={styles.dateInfo}>{displayDate || item?.SchedulingDate}</Text>
          </View>}
        </View>
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
            {item?.ServiceCharges !== undefined && item?.ServiceCharges !== null &&
              <Text style={styles.quantityText}>{`SAR ${String(item.ServiceCharges)}`}</Text>
            }
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>لا توجد مواعيد محجوزة</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.content}>
        {CardArray.length > 0 && (
          <View style={styles.headerActions}>
            <Text style={styles.itemsCount}>الخدمات المختارة ({CardArray.length})</Text>
            <View>
              <Text>{"SAR: " + CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0)}</Text>
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
            <Text style={styles.totalText}>{"SAR: " + CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0)}</Text>
          </View>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{"الضريبة (15%)"}</Text>
            <Text style={styles.totalText}>{`SAR: ${user.CatNationalityId == "213" ? "0.00" : CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0) * 0.15}`}</Text>
          </View>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{"المجموع"}</Text>
            <Text style={styles.totalText}>{`SAR: ${user.CatNationalityId == "213" ? CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0) : CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0) * 0.15 + CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0)} `}</Text>
          </View>

        </View>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#239EA0',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  itemsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearAllButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearAllButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  slotInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dateInfo: {
    fontSize: 14,
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
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  quantityContainer: {
    gap: 10,
  },
  ServiceText: {
    fontSize: 16,
    color: '#666',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 16,
  },
});

export default CartScreen;