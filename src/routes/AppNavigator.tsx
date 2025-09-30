import React, { useEffect, useState } from "react";
import { StatusBar, TouchableOpacity, View, Image, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { CommonActions } from '@react-navigation/native'; // Add this import
import { ROUTES } from "../shared/utils/routes";
import { useTranslation } from "react-i18next";
import { globalTextStyles } from "../styles/globalStyles";

import CartScreen from "../screens/Cart/Cart";
import ProfileScreen from "../screens/Profile/Profile";
import SettingsScreen from "../screens/Settings/Settings";
import CalendarClockIcon from "../assets/icons/CalendarClockIcon";
import AppointmentListScreen from "../screens/Home/AppointmentListScreen";
import AppointmentIconSelected from "../assets/icons/AppointmentIconSelected";
import AppointmentIconNotSelected from "../assets/icons/AppointmentIconNotSelected";
import SettingIconSelected from "../assets/icons/SettingIconSelected";
import SettingIconNotSelected from "../assets/icons/SettingIconNotSelected";
import ProfileIconSelected from "../assets/icons/ProfileIconSelected";
import ProfileIconNotSelected from "../assets/icons/ProfileIconNotSelected";
import CartIconSelected from "../assets/icons/CartIconSelected";
import CartIconNotSelected from "../assets/icons/CartIconNotSelected";
import Services from "../screens/Booking/Services";
import BookingScreen from "../screens/Booking/BookingScreen";
import LocationScreen from "../screens/LocationScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type RenderTabIconProps = {
  routeName: string;
  isFocused: boolean;
};

const HamburgerManu = () => (
  <View style={{
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#ccc',
    alignItems: 'center', justifyContent: 'center'
  }}>
    <Text style={[globalTextStyles.bodyMedium, { color: '#888' }]}>≡</Text>
  </View>
);

function RenderTabIcon({ routeName, isFocused }: RenderTabIconProps) {
  const cardItems = useSelector((state: any) => state.root.booking.cardItems);
  const cardItemsCount = cardItems.length;

  switch (routeName) {
    case "HomeStack":
      return isFocused ? <AppointmentIconSelected width={32} height={32} color="#22A6A7" /> : <AppointmentIconNotSelected width={32} height={32} color="#22A6A7" />;
    case "CartStack":
      return (
        <View style={{ position: 'relative' }}>
          {isFocused ? <CartIconSelected /> : <CartIconNotSelected />}
          {cardItemsCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -8,
              right: -15,
              backgroundColor: '#FF3B30',
              borderRadius: 10,
              paddingHorizontal: 6,
              paddingVertical: 0,
              // minWidth: 20,
              // height: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#FFFFFF',
            }}>
              <Text style={[globalTextStyles.caption, { color: '#FFFFFF', fontWeight: 'bold' }]}>
                {cardItemsCount}
              </Text>
            </View>
          )}
        </View>
      );
    case "ProfileStack":
      return isFocused ? <ProfileIconSelected /> : <ProfileIconNotSelected />;
    case "SettingsStack":
      return isFocused ? <SettingIconSelected /> : <SettingIconNotSelected />;
    default:
      return <></>;
  }
}

const RenderTabText = ({ routeName, isFocused }: RenderTabIconProps) => {
  const { t } = useTranslation();
  switch (routeName) {
    case "HomeStack":
      return (
        <Text
          style={[
            globalTextStyles.bodySmall,
            {
              color: isFocused ? "#22A6A7" : "rgba(99, 110, 114, 1)",
            },
          ]}
        >{t('appointments')}</Text>
      );
    case "CartStack":
      return (
        <Text
          style={[
            globalTextStyles.bodySmall,
            {
              color: isFocused ? "#22A6A7" : "rgba(99, 110, 114, 1)",
            },
          ]}
        >{t('cart')}</Text>
      );
    case "ProfileStack":
      return (
        <Text
          style={[
            globalTextStyles.bodySmall,
            {
              color: isFocused ? "#22A6A7" : "rgba(99, 110, 114, 1)",
            },
          ]}
        >{t('profile')}</Text>
      );
    case "SettingsStack":
      return (
        <Text
          style={[
            globalTextStyles.bodySmall,
            {
              color: isFocused ? "#22A6A7" : "rgba(99, 110, 114, 1)",
            },
          ]}
        >{t('settings')}</Text>
      );
    default:
      return <></>;
  }
}

type CustomTabbarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

// Helper function to get the initial screen name for each stack
const getInitialScreenName = (routeName: string) => {
  switch (routeName) {
    case ROUTES.HomeStack:
      return ROUTES.AppointmentListScreen;
    case ROUTES.CartStack:
      return ROUTES.CartScreen;
    case ROUTES.ProfileStack:
      return ROUTES.ProfileScreen;
    case ROUTES.SettingsStack:
      return ROUTES.SettingsScreen;
    default:
      return null;
  }
};

function CustomTabbar({ state, descriptors, navigation }: CustomTabbarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ backgroundColor: "#ffffff", paddingBottom: insets.bottom }}>
      <View style={[{
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
      }]}>
        {state.routes.map(
          (route: { key: string | number; name: any }, index: any) => {
            const descriptor = descriptors[route.key];
            if (!descriptor) return null;
            const { options } = descriptor;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                // Get the initial screen name for this stack
                const initialScreenName = getInitialScreenName(route.name);
                
                if (initialScreenName) {
                  // Reset the stack to its initial screen
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: route.name,
                          state: {
                            routes: [{ name: initialScreenName }],
                            index: 0,
                          },
                        },
                      ],
                    })
                  );
                } else {
                  // Fallback to normal navigation
                  navigation.navigate(route.name);
                }
              } else if (isFocused) {
                // If already focused, reset to initial screen
                const initialScreenName = getInitialScreenName(route.name);
                if (initialScreenName) {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: route.name,
                          state: {
                            routes: [{ name: initialScreenName }],
                            index: 0,
                          },
                        },
                      ],
                    })
                  );
                }
              }
            }

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={1}
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                key={route.name}
                style={[
                  {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                  },
                ]}
              >
                <>
                  <RenderTabIcon routeName={route.name} isFocused={isFocused} />
                  <RenderTabText routeName={route.name} isFocused={isFocused} />
                  <View
                    style={{
                      width: 10,
                      height: 2,
                      backgroundColor: "#fff",
                      borderRadius: 2,
                    }}
                  ></View>
                </>
              </TouchableOpacity>
            );
          }
        )}
      </View>
    </View>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.AppointmentListScreen} component={AppointmentListScreen} />
      <Stack.Screen name={ROUTES.Services} component={Services} />
      <Stack.Screen name={ROUTES.BookingScreen} component={BookingScreen} />
      <Stack.Screen name={ROUTES.LocationScreen} component={LocationScreen} />
    </Stack.Navigator>
  );
}

function CartStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.CartScreen} component={CartScreen} />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.ProfileScreen} component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.SettingsScreen} component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props: any) => <CustomTabbar {...props} />}
      screenOptions={{
        headerShown: false,
        // You can remove unmountOnBlur if you want to preserve state but reset navigation
        // unmountOnBlur: true,
      }}
    >
      <Tab.Screen name={ROUTES.HomeStack} component={HomeStackNavigator} />
      <Tab.Screen name={ROUTES.CartStack} component={CartStackNavigator} />
      <Tab.Screen name={ROUTES.ProfileStack} component={ProfileStackNavigator} />
      <Tab.Screen name={ROUTES.SettingsStack} component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}