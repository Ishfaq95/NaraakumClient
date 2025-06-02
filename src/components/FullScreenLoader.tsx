import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';

interface FullScreenLoaderProps {
  visible: boolean;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ visible }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#008080" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FullScreenLoader; 