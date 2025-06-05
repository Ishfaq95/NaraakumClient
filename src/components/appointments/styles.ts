import { Dimensions, StyleSheet } from 'react-native';
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
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 18,
    fontWeight: '600',
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
    color: '#FFFFFF',
    fontSize: 12,
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
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  tabView: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
}); 