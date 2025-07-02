// import CustomSwitch from '../../components/common/CustomSwitch';
// import React, { useState, useEffect } from 'react';
// import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Modal } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { bookingService } from '../../services/api/BookingService';
// import { useTranslation } from 'react-i18next';
// import { addCardItem } from '../../shared/redux/reducers/bookingReducer';
// import { generatePayloadForCheckOut } from '../../shared/services/service';

// const Payment = ({ onPressNext, onPressBack }: any) => {
//   const { t } = useTranslation();
//   const CardArray = useSelector((state: any) => state.root.booking.cardItems);
//   const user = useSelector((state: any) => state.root.user.user);
//   const [enabled, setEnabled] = useState(false);
//   const [wallet, setWallet] = useState<number>(0);
//   const [loading, setLoading] = useState(false);
//   const [showPaymentAlertModal, setShowPaymentAlertModal] = useState(false);
//   const dispatch = useDispatch();
//   useEffect(() => {
//     const getUnPaidUserOrders = async () => {
//       try {
//         const response = await bookingService.getUnPaidUserOrders({ UserLoginInfoId: user.Id });

//         if (response.Cart && response.Cart.length > 0) {
//           // Convert API response to cardItems format
//           const convertedCardItems = response.Cart;

//           // Check for existing items and replace duplicates instead of adding
//           const existingCardItems: any[] = [];
//           const updatedCardItems = [...existingCardItems];

//           convertedCardItems.forEach((newItem: any) => {
//             // Find if item already exists by OrderDetailId and OrderId
//             const existingIndex = updatedCardItems.findIndex((existingItem: any) =>
//               existingItem.OrderDetailId === newItem.OrderDetailId &&
//               existingItem.OrderId === newItem.OrderId
//             );

//             if (existingIndex !== -1) {
//               const newItemObject = {
//                 ...newItem,
//                 PatientUserProfileInfoId: user.UserProfileInfoId,
//                 TextDescription: "",
//               }
//               // Replace existing item with new one
//               updatedCardItems[existingIndex] = newItemObject;
//             } else {
//               // Add new item if it doesn't exist
//               const newItemObject = {
//                 ...newItem,
//                 PatientUserProfileInfoId: user.UserProfileInfoId,
//                 TextDescription: "",
//               }
//               updatedCardItems.push(newItemObject);
//             }
//           });

//           // Dispatch the updated array
//           dispatch(addCardItem(updatedCardItems));
//         }
//       } catch (error) {
//         console.error('Error fetching unpaid orders:', error);
//       }
//     }
//     getUnPaidUserOrders();
//   }, [user]);

//   useEffect(() => {
//     const fetchWallet = async () => {
//       if (!user?.Id) return;
//       setLoading(true);
//       try {
//         const res = await bookingService.getUpdatedWallet({ UserLoginInfoId: user.Id });


//         if (res?.ResponseStatus.STATUSCODE === 200) {
//           setWallet(res?.Wallet[0]?.TotalAmount ?? 0);
//         } else {
//           setWallet(0);
//         }
//       } catch (e) {
//         setWallet(0);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchWallet();
//   }, [user]);

//   const handleNext = async () => {
//     if(wallet < CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0)){
//       setShowPaymentAlertModal(true);
//       return;
//     }
//     if(enabled){
//       const payload = {
//         "UserLoginInfoId": user.Id,
//         "OrderId": CardArray[0].OrderID,
//         "NetAmountRecieved": CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0),
//         "TransactionId": "NK" + Date.now().toString(),
//         "Currency": "682",
//         "Language": "Ar",
//         "MerchantIdentifier": "1000004407",
//         "PaymentOption": "Card",
//         "MerchantStatus": "Pending",
//         "SecureHash": "44fcc9371621f0ea10e0eba928df2cacc823b6ee504a48ed70e5ea6a56bfa80f",
//         "CardType": 1,
//         "CatPlatformId": 1,
//         "BookingFromWallet": 1,
//         "OrderDetail": generatePayloadForCheckOut(CardArray)
//       }
  
//       console.log("payload", payload);
//       const response = await bookingService.updateOrderMainToCheckOut(payload);
//       console.log("response", response);
//       if(response?.ResponseStatus?.STATUSCODE === 200){
//         onPressNext(response);
//       }
      
      
//     }
    
//   };

//   const handleBack = () => {
//     onPressBack();
//   };

//   return (
//     <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' }}>
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
//         <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>المبلغ الإجمالي</Text>
//         <Text style={{ fontSize: 16, fontWeight: '700', color: '#23a2a4' }}>{`SAR ${CardArray.reduce((acc: number, item: any) => acc + Number(item.ServiceCharges), 0)}`}</Text>
//       </View>

//       <View style={{ flexDirection: 'row', width: "100%", justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, backgroundColor: "#eff5f5", paddingHorizontal: 16 }}>
//         <View style={{ alignItems: "flex-start" }}>
//           <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>استخدم رصيد المحفظة :</Text>
//           <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{`SAR ${wallet?.toFixed(2)}`}</Text>
//         </View>
//         <View style={{}}>
//           <CustomSwitch value={enabled} onValueChange={setEnabled} />
//         </View>
//       </View>

//       {/* Buttons */}
//       <View style={styles.BottomContainer}>
//         <TouchableOpacity style={styles.backButton} onPress={handleBack}>
//           <Text style={styles.backButtonText}>{t('back')}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.nextButton]}
//           onPress={handleNext}
//         >
//           <Text style={styles.nextButtonText}>{t('next')}</Text>
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={showPaymentAlertModal}
//         onRequestClose={() => setShowPaymentAlertModal(false)}
//         transparent={true}
//         animationType='fade'
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             {/* Header */}
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>تحذير</Text>
//               <TouchableOpacity onPress={() => setShowPaymentAlertModal(false)}>
//                 <Text style={styles.closeIcon}>×</Text>
//               </TouchableOpacity>
//             </View>
//             {/* Message and Button */}
//             <View style={styles.modalContent}>
//               <Text style={styles.modalMessage}>يرجى اختيار خدمة واحدة</Text>
//               <TouchableOpacity
//                 onPress={() => setShowPaymentAlertModal(false)}
//                 style={styles.modalButton}
//               >
//                 <Text style={styles.modalButtonText}>يغلق</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 'auto',
//     paddingTop: 20,
//   },
//   backButton: {
//     width: "34%",
//     height: 50,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#179c8e',
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   nextButton: {
//     width: "64%",
//     height: 50,
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 8,
//     backgroundColor: '#179c8e',
//   },
//   backButtonText: {
//     color: '#179c8e',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   nextButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   BottomContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     height: 60,
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//   },
//   disabledNextButton: {
//     opacity: 0.5,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: 320,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#e8f3f2',
//     padding: 16,
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   modalTitle: {
//     fontWeight: 'bold',
//     fontSize: 18,
//     color: '#2d3a3a',
//   },
//   closeIcon: {
//     fontSize: 22,
//     color: '#888',
//   },
//   modalContent: {
//     padding: 24,
//     alignItems: 'center',
//   },
//   modalMessage: {
//     fontSize: 16,
//     color: '#2d3a3a',
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   modalButton: {
//     backgroundColor: '#27a6a1',
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 36,
//     alignItems: 'center',
//     alignSelf: 'center',
//     shadowColor: '#27a6a1',
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// })

// export default Payment; 





import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState,
  Linking,
  Text,
} from 'react-native';
import LoaderKit from 'react-native-loader-kit';
import {WebView} from 'react-native-webview';

import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';
import {ROUTES} from '../../shared/utils/routes';
import {useNavigation} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { clearCardItems } from '../../shared/redux/reducers/bookingReducer';
import { encryptText } from '../../shared/services/service';
import { WEBSITE_URL } from '../../shared/utils/constants';

const Payment = ({ onPressNext, onPressBack }: any) => {
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState<any>(null);
  const [reloadWebView, setReloadWebView] = useState(false);
  const [latestUrl, setLatestUrl] = useState('');
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const injectedJavaScript = `
    (function() {
      // Helper function to log messages to React Native
      function logToReactNative(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ log: message }));
      }

      // Function to send token and user info to React Native app
      function sendTokenAndUserInfoToReactNativeApp() {
        try {
          var token = NK.Common.webAPIAccessToken;
          var userInfo = NK.Common.getLoggedInUser();
          var data = { token: token };
          if (userInfo) {
            data.userInfo = userInfo;
          }
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        } catch (error) {
          logToReactNative("Error in sendTokenAndUserInfoToReactNativeApp: " + error.message);
        }
      }

      // Overwrite window.open to send the full URL and query params to React Native app
      window.open = function(url) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ url: url }));
      };

      // Call the function to send token and user info immediately
      sendTokenAndUserInfoToReactNativeApp();
    })();
    true;
  `;

  const user = useSelector((state: any) => state.root.user.user);

  const generatePaymentUrl = async () => {
    console.log("user here 1")
    const dataUser = {Id:user.Id,FullNameSlang:user.FullnameSlang}
    const paramsJson = JSON.stringify(dataUser);
    const encryptedVisitData = encryptText(paramsJson, '!naarakum@789');
    console.log("encryptedVisitData",`${WEBSITE_URL}service/payment?mudfp=${encryptedVisitData}`)
    return `${WEBSITE_URL}service/payment?mudfp=${encryptedVisitData}`
  }

  useEffect(() => {
    console.log("user here")
    const getPaymentUrl = async () => {
      setLoading(true);
      const paymentUrl:any = await generatePaymentUrl()
      console.log("paymentUrl",paymentUrl)
      setCurrentUrl(paymentUrl);
      setLoading(false);
    }
    getPaymentUrl();
  }, [])

  const handleMessage = async (event: any) => {
    const {
      url,
      userInfo,
      event: eventHandler,
      data,
      fileName,
    } = JSON.parse(event.nativeEvent.data);

  };

  const handleLoadError = (event: any) => {
    setLoading(false);
    setReloadWebView(true);
    setTimeout(() => {
      setReloadWebView(false);
    }, 100);
  };


  const onNavigationStateChange = (url: any) => {
    if(url.url.includes("PaymentSuccess")){
      dispatch(clearCardItems());
      navigation.navigate("OrderSuccess", { OrderId:1 });
    }
    // else if(url.url.includes("PaymentFailed")){
    //   onPressBack();
    // }
    console.log("url",url)
  };

  if(currentUrl == null){
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        {reloadWebView ? (
          <View style={styles.loader}>
            <LoaderKit
              style={{width: 100, height: 100}}
              name={'BallSpinFadeLoader'}
              color={'green'}
            />
          </View>
        ) : Platform.OS === 'ios' ? (
          <WebView
            ref={webViewRef}
            source={{uri: currentUrl}}
            useWebKit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
            }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            setSupportMultipleWindows={true} // Enable multiple windows on Android
            // userAgent={Platform.OS === 'android' ? 'Chrome/18.0.1025.133 Mobile Safari/535.19' : 'AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75'}
            userAgent={
              'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1'
            }
            originWhitelist={['https://*', 'http://*', 'file://*', 'sms://*']}
            geolocationEnabled={true}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            onError={handleLoadError}
            onNavigationStateChange={onNavigationStateChange}
            style={styles.webview}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{uri: currentUrl}}
            useWebKit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            cacheEnabled={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
            }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            setSupportMultipleWindows={true} // Enable multiple windows on Android
            // userAgent={Platform.OS === 'android' ? 'Chrome/18.0.1025.133 Mobile Safari/535.19' : 'AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75'}
            userAgent={
              'Mozilla/5.0 (Linux; Android 10; Mobile; rv:79.0) Gecko/79.0 Firefox/79.0'
            }
            originWhitelist={['https://*', 'http://*', 'file://*', 'sms://*']}
            geolocationEnabled={true}
            javaScriptEnabledAndroid={true}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            onError={handleLoadError}
            onNavigationStateChange={onNavigationStateChange}
            style={styles.webview}
          />
        )}
      </View>
      {loading && (
        <View style={styles.loader}>
          <LoaderKit
            style={{width: 100, height: 100}}
            name={'BallSpinFadeLoader'}
            color={'green'}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
});

export default Payment;
