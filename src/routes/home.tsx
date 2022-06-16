import React, { useContext, useEffect } from "react";
import { Button, Text, View } from "react-native";
import { Peripheral } from "react-native-ble-manager";

import { PeripheralContext, RootStackParamList } from "../../App";
import { Style } from "../styles";

import BluetoothIcon from "../assets/icons/bluetooth-outline.svg";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export function Home(props: NativeStackScreenProps<RootStackParamList, "Home">) {
    const { navigation, route } = props;
    const peripheralContext = useContext(PeripheralContext)!;
    const iconColor = peripheralContext.peripheral ? "cyan" : "gray";

    return (
        <View style={[Style.bodyDark, { flex: 1, alignItems: 'center' }]}>
            {peripheralContext.peripheral &&
                <View>
                    <Text style={[Style.textLarge, { color: "#00bbcc" }]}>
                        Connected to {peripheralContext.peripheral.name}
                    </Text>
                </View>
            }
            {!peripheralContext.peripheral &&
                <>
                    <View>
                        <Text style={Style.text}>No device connected</Text>
                    </View>
                    <View>
                        <BluetoothIcon width={100} height={100} fill={iconColor} />
                    </View>
                </>
            }
            <View style={[Style.well]}>
                <View style={[Style.section]}>
                    <Button title="Manage peripheral" onPress={() => navigation.navigate("Peripherals")} />
                </View>
                <View style={[Style.section]}>
                    <Button title={"Stats"} onPress={() => navigation.navigate("Stats")} disabled={!peripheralContext || !peripheralContext.peripheral} />
                </View>
            </View>
        </View>
    );
}
