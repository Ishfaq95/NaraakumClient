import { useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";

export const Connectivity = () => {
  const netInfo = useNetInfo();
  const [didMount, setDidMount] = useState(false);
  const [previousConnection, setPreviousConnection] = useState(null);

  useEffect(() => {
    setDidMount(true);
  }, []);

  useEffect(() => {
    if (didMount) {
      if (netInfo.isConnected !== previousConnection) {
        if (!netInfo.isConnected) {
        //   dispatch(setNetworkConnectivity(false));
        //   Alert.alert(
        //     "Connectivity issue",
        //     "You are not connected to the internet"
        //   );
        } else {
        //   dispatch(setNetworkConnectivity(true));
        }
        setPreviousConnection(netInfo.isConnected);
      }
    }
  }, [netInfo.isConnected, didMount, previousConnection]);

  // render
  return null;
};
