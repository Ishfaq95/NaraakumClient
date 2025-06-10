import Header from "../../components/common/Header";
import { useTranslation } from "react-i18next";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";

const ProfileScreen = () => {
  const { t } = useTranslation();

  const renderHeader = () => (
    <Header
      centerComponent={
        <Text style={styles.headerTitle}>{t('profile')}</Text>
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

export default ProfileScreen;