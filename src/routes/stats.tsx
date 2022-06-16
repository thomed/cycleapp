import React, { useContext, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import BleManager, { PeripheralInfo } from "react-native-ble-manager";
import Toast from "react-native-toast-message";

import { bleManagerEmitter, PeripheralContext, RootStackParamList } from "../../App";
import { Style } from "../styles";
import { ServiceUuid } from "../enumerations";
import { CscMeasurement } from "../classes";


export function Stats(props: NativeStackScreenProps<RootStackParamList, "Stats">) {
    const maxHistory = 10;
    const debug = true;
    const { navigation, route } = props;
    const peripheralContext = useContext(PeripheralContext);
    const [peripheralInfo, setPeripheralInfo] = useState<PeripheralInfo>();
    const [cscMeasurements, setCscMeasurements] = useState<CscMeasurement[]>([]);
    const [cadence, setCadence] = useState(0);

    /**
     * This function receives the data from a ble peripheral when a value for a characteristic
     * is updated and we are listening for ble notifications.
     * @param value
     */
    function handleUpdateCharacteristic(value: any) {
        let bytes: number[] = value?.value;
        if (bytes) {
            let cscMeasurement = CscMeasurement.FromBytes(bytes);
            if (cscMeasurement) {
                if (cscMeasurements.length < maxHistory) {
                    setCscMeasurements([...cscMeasurements, cscMeasurement]);
                } else {
                    setCscMeasurements([...cscMeasurements.slice(1), cscMeasurement]);
                }
            }
        }
    }

    useEffect(() => {
        // If no peripheral connected then navigate back home
        if (!peripheralContext?.peripheral) {
            navigation.navigate("Home");
        } else {
            let peripheral = peripheralContext.peripheral;

            // Get peripheral services
            BleManager.retrieveServices(peripheral.id, peripheral.advertising.serviceUUIDs)
                .then((v) => {
                    setPeripheralInfo(v);
                }).catch((reason) => {
                    Toast.show({
                        type: "error",
                        text1: "Couldn't get peripheral info."
                    });
                });
        }
    }, [peripheralContext]);

    useEffect(() => {
        // If we have peripheral info, start reading/listening to supported services
        if (peripheralInfo) {

            // If the peripheral supports CSC measurement notification then start listening to it
            let cscMeasurementCharacteristic = peripheralInfo.characteristics?.find(c => c.characteristic === ServiceUuid.CSCMeasurement);
            if (cscMeasurementCharacteristic) {
                BleManager.startNotification(peripheralContext!.peripheral!.id, cscMeasurementCharacteristic.service, cscMeasurementCharacteristic.characteristic)
                    .then(() => {
                        console.log("CSC notification started");
                    }).catch(() => {
                        console.log("Unable to start CSC notification");
                    });
            }
        }

        return (() => {
            // If we have peripheral info, clean up readers/listeners
            if (peripheralInfo) {

                // If the peripheral supports CSC measurement notification then stop listening to it
                let cscMeasurementCharacteristic = peripheralInfo.characteristics?.find(c => c.characteristic === ServiceUuid.CSCMeasurement);
                if (cscMeasurementCharacteristic) {
                    BleManager.stopNotification(peripheralContext!.peripheral!.id, cscMeasurementCharacteristic.service, cscMeasurementCharacteristic.characteristic)
                        .then(() => {
                            console.log("CSC notification stopped.")
                        }).catch(() => {
                            console.log("Unable to stop CSC notification");
                        });
                }
            }
        });
    }, [peripheralInfo]);

    useEffect(() => {
        // If we have at least 2 measurements then calculate current cadence
        if (cscMeasurements.length > 1) {
            let current = cscMeasurements.at(-1);
            let previous = cscMeasurements.at(-2);

            let crankDiff = current!.cumulativeCrankRevolutions - previous!.cumulativeCrankRevolutions;
            let wheelDiff = current!.cumulativeWheelRevolutions - previous!.cumulativeWheelRevolutions;
            let timeDiff = current!.lastCrankEventTime - previous!.lastCrankEventTime;

            if (crankDiff <= 0 || timeDiff <= 0) {
                setCadence(0);
            } else {
                let c = (crankDiff / timeDiff) * 60 * 1024;
                setCadence(Math.floor(c));
            }
        }

        // When recorded history changed we need to update handler
        const valueUpdated = bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic", handleUpdateCharacteristic);

        return () => {
            valueUpdated.remove();
        };
    }, [cscMeasurements]);

    return (
        <View style={[Style.bodyDark, { flex: 1, alignItems: "center" }]}>
            <Text style={[Style.textXXLarge]}>{cadence}</Text>

            {/* Used to display some debug info on screen */}
            {debug &&
                <View style={[Style.well, Style.section, { width: "95%" }]}>
                    <Text>Debug</Text>
                    <Text>History length: {cscMeasurements.length}</Text>
                    <Text>
                        Cranks: {cscMeasurements.at(-1)?.cumulativeCrankRevolutions}
                    </Text>
                    <Text>
                        Wheels: {cscMeasurements.at(-1)?.cumulativeWheelRevolutions}
                    </Text>
                </View>
            }
        </View>
    );
}