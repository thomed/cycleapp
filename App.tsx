import React, { createContext, Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { EmitterSubscription, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BleManager, { Peripheral, PeripheralInfo } from 'react-native-ble-manager';
import Toast from 'react-native-toast-message';

import { Home, Stats } from './src/routes';
import { Style } from './src/styles';
import { Peripherals } from './src/routes/peripheral';

const BleManagerModule = NativeModules.BleManager;
export const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export type RootStackParamList = {
  Home: undefined,
  Stats: undefined,
  Peripherals: undefined
}
const Stack = createNativeStackNavigator<RootStackParamList>();

interface IPeripheralContext {
  peripheral?: Peripheral,
  setPeripheral: Dispatch<SetStateAction<Peripheral | undefined>>,
  peripheralInfo?: PeripheralInfo,
  setPeripheralInfo: Dispatch<SetStateAction<PeripheralInfo | undefined>>
}
export const PeripheralContext = createContext<IPeripheralContext | undefined>(undefined);


function App() {
  const [peripheral, setPeripheral] = useState<Peripheral>();
  const [peripheralInfo, setPeripheralInfo] = useState<PeripheralInfo>();

  // State for the peripheral context
  const peripheralContextValue = useMemo<IPeripheralContext>(() => ({
    peripheral: peripheral,
    setPeripheral: setPeripheral,
    peripheralInfo: peripheralInfo,
    setPeripheralInfo: setPeripheral
  }), [peripheral, peripheralInfo]);

  /**
   * When the device is disconnected clear it from the context.
   * @param arg See react-native-ble-manager docs.
   */
  function handlePeripheralDisconnect(arg: { peripheral: string }) {
    let id = arg.peripheral;

    if (peripheral && id === peripheral.id) {
      setPeripheral(undefined);
      setPeripheralInfo(undefined);
      Toast.show({
        type: "info",
        text1: "Device disconnected"
      });
    }
  }

  useEffect(() => {
    // Peripheral event listeners
    const peripheralDisconnected: EmitterSubscription = bleManagerEmitter.addListener("BleManagerDisconnectPeripheral", handlePeripheralDisconnect);

    return () => {
      peripheralDisconnected.remove();
    };
  }, [peripheral]);

  useEffect(() => {
    // Start BleManager
    BleManager.start({ showAlert: true }).then(() => {
      console.log("Bluetooth started");
    });

    // Check permissions for Android
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }
  }, []);

  return (
    <>
      <PeripheralContext.Provider value={peripheralContextValue}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName='Home'
            screenOptions={{
              // headerShown: false,
              headerStyle: Style.headerMain,
              headerTitleStyle: Style.headerTitle

            }}
          >
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Stats" component={Stats} />
            <Stack.Screen name="Peripherals" component={Peripherals} />
          </Stack.Navigator>
        </NavigationContainer>
      </PeripheralContext.Provider>
      <Toast />
    </>
  );
};

export default App;
