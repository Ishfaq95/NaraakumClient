import Header from "../../components/common/Header";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

const CartScreen = () => {
  const { t } = useTranslation();
  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('cart')}</Text>
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#239EA0',
  },
});


export default CartScreen;