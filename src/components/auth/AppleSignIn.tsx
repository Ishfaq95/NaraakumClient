import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { useDispatch } from 'react-redux';
import { setUser } from '../../shared/redux/reducers/userReducer';
import { ROUTES } from '../../shared/utils/routes';

interface AppleSignInProps {
  navigation: any;
}

const AppleSignIn: React.FC<AppleSignInProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  const onAppleButtonPress = async () => {
    try {
      // Start the sign-in request
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }

      // Create a credential from the response
      const { identityToken, nonce } = appleAuthResponse;

      // You would typically send this to your backend
      const userData = {
        identityToken,
        nonce,
        fullName: appleAuthResponse.fullName,
        email: appleAuthResponse.email,
      };

      // For now, we'll just dispatch to Redux and navigate
      dispatch(setUser(userData));
      navigation.replace(ROUTES.AppointmentList);
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.log('User canceled Apple Sign in.');
      } else {
        console.log('Apple Sign in error:', error);
      }
    }
  };

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.appleButton}
      onPress={onAppleButtonPress}
    >
      <Text style={styles.appleButtonText}>Sign in with Apple</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  appleButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppleSignIn; 