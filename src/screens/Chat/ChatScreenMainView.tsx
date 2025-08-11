import { View, Text } from 'react-native'
import React, { memo, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native';
import ChatScreen from './ChatSceen';

const MemoizedChatScreen = memo(ChatScreen);

const ChatScreenMainView = ({route}: any) => {
    const {patientId, serviceProviderId, displayName} = route.params;

    console.log("route", route.params);
    const navigation = useNavigation();

    const handleBackPress = () => {
        navigation.goBack();
    }

      // Update chatScreenProps
  const chatScreenProps = useMemo(
    () => ({
      patientId: patientId,
      serviceProviderId: serviceProviderId,
      onBackPress: handleBackPress,
      displayName,
    }),
    [
      patientId,
      serviceProviderId,
      displayName,
    ],
  );

  console.log("chatScreenProps", chatScreenProps);
  return (
    <View style={{flex:1}}>
      <MemoizedChatScreen {...chatScreenProps} />
    </View>
  )
}

export default ChatScreenMainView