import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface HeaderProps {
  leftComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({
  leftComponent,
  centerComponent,
  rightComponent,
  containerStyle,
}) => {
  return (
    <View style={[styles.header, containerStyle]}>
      <View style={styles.headerLeft}>
        {leftComponent || <View style={styles.placeholder} />}
      </View>
      <View style={styles.headerCenter}>
        {centerComponent || <View style={styles.placeholder} />}
      </View>
      <View style={styles.headerRight}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
});

export default Header; 