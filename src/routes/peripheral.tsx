import React, { useContext, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Alert, Button, FlatList, Text, View } from "react-native";
import BleManager, { Peripheral } from "react-native-ble-manager";
import Toast from 'react-native-toast-message';

import { PeripheralContext, RootStackParamList } from "../../App";
import { Style } from "../styles";
import { bleManagerEmitter } from "../../App";
import { ServiceUuid } from "../enumerations";
import { PeripheralCard } from "../components/peripheral-card";
import { VictoryLabel, VictoryLine } from "victory-native";

export function Peripherals(props: NativeStackScreenProps<RootStackParamList, "Peripherals">) {
    const peripheralContext = useContext(PeripheralContext)!;
    const [scanning, setScanning] = useState<boolean>(false);
    const [peripherals, setPeripherals] = useState<Map<string, Peripheral>>(new Map());

    function startScan() {
        console.log("Starting bluetooth scan...");
        BleManager.scan([], 10, false);
        setPeripherals(new Map());
        setScanning(true);
    }

    function handleScanStop() {
        console.log("Bluetooth scan stopped.");
        setScanning(false);
    }

    function handleDiscoverPeripheral(peripheral: Peripheral) {
        let serviceUuids = peripheral.advertising.serviceUUIDs;

        // Find peripherals with cycle service uuid and save
        if (peripheral.name && serviceUuids?.find(s => s === ServiceUuid.CyclingSpeedCadence)) {
            if (!peripherals.has(peripheral.id)) {
                setPeripherals(new Map(peripherals.set(peripheral.id, peripheral)));
            }
        }
    }

    function handleSelectPeripheral(peripheral: Peripheral) {
        // console.log(peripheral);

        if (peripheral) {
            BleManager.connect(peripheral.id).then(() => {
                Toast.show({
                    type: "info",
                    text1: "Connected!",
                    visibilityTime: 1000
                });
                peripheralContext.setPeripheral(peripheral);
                props.navigation.navigate("Home");
            }).catch((error) => {
                Toast.show({
                    type: "error",
                    text1: "Failed to connect!",
                    text2: error,

                });
            });
        }
    }

    useEffect(() => {
        let deviceDiscovered = bleManagerEmitter.addListener("BleManagerDiscoverPeripheral", handleDiscoverPeripheral);
        let scanStop = bleManagerEmitter.addListener("BleManagerStopScan", handleScanStop);

        return () => {
            deviceDiscovered.remove();
            scanStop.remove();
        };
    }, []);

    return (
        <View style={[Style.bodyDark, { flex: 1 }]}>
            <View style={[Style.section]}>
                <Text style={[Style.text]}>Connected Device: {peripheralContext?.peripheral?.name || "none"}</Text>
                <Button title="Start scan" disabled={scanning} onPress={startScan} />
            </View>
            <View style={[Style.section]}>
                {scanning &&
                    <ActivityIndicator size={"large"} />
                }
            </View>

            {/* Show discovered bluetooth devices */}
            <View style={[Style.section, Style.well]}>
                <FlatList
                    // data={[1, 2]}
                    data={Array.from(peripherals.values())}
                    renderItem={(e) => {
                        return (
                            // <Button title="asdf" />
                            <PeripheralCard peripheral={e.item} onPress={handleSelectPeripheral} />
                        );
                    }}
                />
            </View>
        </View>
    );
}