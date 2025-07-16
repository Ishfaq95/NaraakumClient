import { Dimensions, StyleSheet } from 'react-native';
import { globalTextStyles } from '../../styles/globalStyles';
const windowHeight = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  emptyContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: windowHeight - 200,
  },
  contentContainer: {
    padding: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabLabel: {
    ...globalTextStyles.bodySmall,
    fontFamily: globalTextStyles.h5.fontFamily,
    textTransform: 'none',
  },
  indicator: {
    backgroundColor: '#008080',
    height: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    width: 80,
  },
  headerTitle: {
    ...globalTextStyles.h4,
    color: '#000000',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: 80,
  },
  logoutButtonText: {
    ...globalTextStyles.caption,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    width: 80,
  },
  bookButtonText: {
    ...globalTextStyles.caption,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tabView: {
    flex: 1,
  },
  text: {
    ...globalTextStyles.bodyMedium,
    color: '#000',
  },
}); 