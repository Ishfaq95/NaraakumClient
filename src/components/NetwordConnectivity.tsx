import { useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../shared/utils/routes";

export const Connectivity = () => {
  const netInfo = useNetInfo();
  const [didMount, setDidMount] = useState(false);
  const [previousConnection, setPreviousConnection] = useState(false);
  const navigation=useNavigation()

  useEffect(() => {
    setDidMount(true);
  }, []);

  useEffect(() => {
    if (didMount) {
      if (netInfo.isConnected !== previousConnection) {
        if (!netInfo.isConnected) {
          navigation.navigate(ROUTES.NetworkError)
        } else {
          navigation.navigate(ROUTES.AppNavigator, {
            screen: ROUTES.HomeStack,
            params: {
              screen: ROUTES.AppointmentListScreen,
            }
          });
        }
        setPreviousConnection(netInfo.isConnected);
      }
    }
  }, [netInfo.isConnected, didMount, previousConnection]);

  // render
  return null;
};
