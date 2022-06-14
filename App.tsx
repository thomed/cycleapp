import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Peripheral, PeripheralInfo } from 'react-native-ble-manager';

import { Home, Stats } from './src/routes';
import { Style } from './src/styles';

export type RootStackParamList = {
  Home: undefined,
  Stats: undefined
}
const Stack = createNativeStackNavigator<RootStackParamList>();

interface IPeripheralContext {
  peripheral?: Peripheral,
  setPeripheral?: Dispatch<SetStateAction<Peripheral | undefined>>,
  peripheralInfo?: PeripheralInfo,
  setPeripheralInfo?: Dispatch<SetStateAction<PeripheralInfo | undefined>>
}
export const PeripheralContext = createContext<IPeripheralContext | undefined>(undefined);

function App() {
  const [peripheral, setPeripheral] = useState<Peripheral>();
  const [peripheralInfo, setPeripheralInfo] = useState<PeripheralInfo>();

  const initialPeripheralContext: IPeripheralContext = {
    peripheral: peripheral,
    setPeripheral: setPeripheral,
    peripheralInfo: peripheralInfo,
    setPeripheralInfo: setPeripheralInfo
  };

  return (
    <PeripheralContext.Provider value={initialPeripheralContext}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </PeripheralContext.Provider>
  );
};

export default App;
