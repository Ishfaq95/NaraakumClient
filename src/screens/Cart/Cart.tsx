import Header from "../../components/common/Header";
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { removeCardItem, clearCardItems } from "../../shared/redux/reducers/bookingReducer";
import moment from "moment";
import MinusIcon from "../../assets/icons/MinuesIcon";

const CartScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cardItems = useSelector((state: any) => state.root.booking.cardItems);
  const category = useSelector((state: any) => state.root.booking.category);
  const selectedSpecialtyOrService = useSelector((state: any) => state.root.booking.selectedSpecialtyOrService);
  const user = useSelector((state: any) => state.root.user.user);

  console.log("user",user)

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('cart')}</Text>
      }
    />
  );

  const handleRemoveItem = (providerId: string) => {
    dispatch(removeCardItem(providerId));
  };

  const handleClearAll = () => {
    dispatch(clearCardItems());
  };

  const renderCardItem = ({ item }: { item: any }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardItemContent}>
        <Text style={styles.providerName}>{item.providerName}</Text>
        <View style={styles.slotInfoContainer}>
          <Text style={styles.slotInfo}>{item.selectedSlot.split(' ')[0]}</Text>
          <Text style={styles.dateInfo}>{moment(item.selectedDate).format('DD/MM/YYYY')}</Text>
        </View>
      </View>
      <View style={styles.removeButtonContainer}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.providerId)}
        >
          <MinusIcon width={22} height={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.quantityContainer}>
          <Text style={styles.ServiceText}>{`${category.TitleSlang}/${selectedSpecialtyOrService.TitleSlang}`}</Text>
          <Text style={styles.quantityText}>{`SAR ${item.provider.Prices}`}</Text>
        </View>
      </View>

    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>لا توجد مواعيد محجوزة</Text>
    </View>
  );

  console.log("cardItems", cardItems)

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.content}>
        {cardItems.length > 0 && (
          <View style={styles.headerActions}>
            <Text style={styles.itemsCount}>الخدمات المختارة ({cardItems.length})</Text>
            <View>
              <Text>{"SAR: " + cardItems.reduce((acc: number, item: any) => acc + Number(item.provider.Prices), 0)}</Text>
            </View>
          </View>
        )}
        <FlatList
          data={cardItems}
          renderItem={renderCardItem}
          keyExtractor={(item) => item.providerId}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyCart}
        />
        <View style={styles.totalContainer}>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{"إجمالي الخدمات"}</Text>
            <Text style={styles.totalText}>{"SAR: " + cardItems.reduce((acc: number, item: any) => acc + Number(item.provider.Prices), 0)}</Text>
          </View>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{"الضريبة (15%)"}</Text>
            <Text style={styles.totalText}>{`SAR: ${user.CatNationalityId == "213" ? "0.00" : cardItems.reduce((acc: number, item: any) => acc + Number(item.provider.Prices), 0) * 0.15}`}</Text>
          </View>
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalText}>{"المجموع"}</Text>
            <Text style={styles.totalText}>{`SAR: ${user.CatNationalityId == "213" ? cardItems.reduce((acc: number, item: any) => acc + Number(item.provider.Prices), 0) : cardItems.reduce((acc: number, item: any) => acc + Number(item.provider.Prices), 0) * 0.15 + cardItems.reduce((acc: number, item: any) => acc + Number(item.provider.Prices), 0)} `}</Text>
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
    backgroundColor:"#e4f1ef",
    padding:10,
    borderRadius:10,
    marginTop:10,
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