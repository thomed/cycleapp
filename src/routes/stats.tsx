import React, { useContext, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import BleManager, { PeripheralInfo } from "react-native-ble-manager";
import Toast from "react-native-toast-message";

import "core-js/modules/es.array.at";

import { bleManagerEmitter, PeripheralContext, RootStackParamList } from "../../App";
import { Style, Window } from "../styles";
import { CharacteristicUuid, ServiceUuid } from "../enumerations";
import { CscMeasurement } from "../classes";
import { IndoorBikeData } from "../classes/indoor-bike-data";


export function Stats(props: NativeStackScreenProps<RootStackParamList, "Stats">) {
    const maxHistory = 10;
    const debug = false;
    const { navigation, route } = props;
    const peripheralContext = useContext(PeripheralContext);
    const [peripheralInfo, setPeripheralInfo] = useState<PeripheralInfo>();
    const [cscMeasurements, setCscMeasurements] = useState<CscMeasurement[]>([]);

    const [cadence, setCadence] = useState<number>(0);
    const [indoorBikeData, setIndoorBikeData] = useState<IndoorBikeData>();

    let minSectionWidth = Window.width / 2;

    /**
     * This function receives the data from a ble peripheral when a value for a characteristic
     * is updated and we are listening for ble notifications.
     * @param value
     */
    function handleUpdateCharacteristic(value: any) {
        let service: string = value?.service;
        let characteristic: string = value?.characteristic;
        let bytes: number[] = value?.value;

        if (bytes) {
            switch (service?.substring(4, 8)) {
                case ServiceUuid.CyclingSpeedCadence:
                    // CSC characteristic
                    if (characteristic?.substring(4, 8) === CharacteristicUuid.CSCMeasurement) {
                        let cscMeasurement = CscMeasurement.FromBytes(bytes);
                        if (cscMeasurement) {
                            if (cscMeasurements.length < maxHistory) {
                                setCscMeasurements([...cscMeasurements, cscMeasurement]);
                            } else {
                                setCscMeasurements([...cscMeasurements.slice(1), cscMeasurement]);
                            }
                        }
                    }
                    break;
                case ServiceUuid.FitnessMachine:
                    // IndoorBikeData characteristic
                    if (characteristic?.substring(4, 8) === CharacteristicUuid.IndoorBikeData) {
                        let indoorBikeData = IndoorBikeData.FromBytes(bytes);
                        setIndoorBikeData(indoorBikeData);
                    }
                    break;
                default:
                    break;
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
            console.log({ peripheralInfo });
            // If the peripheral supports CSC measurement notification then start listening to it
            let cscMeasurementCharacteristic = peripheralInfo.characteristics?.find(c => c.characteristic === CharacteristicUuid.CSCMeasurement);
            if (cscMeasurementCharacteristic) {
                BleManager.startNotification(peripheralContext!.peripheral!.id, cscMeasurementCharacteristic.service, cscMeasurementCharacteristic.characteristic)
                    .then(() => {
                        console.log("CSC notification started");
                    }).catch(() => {
                        console.log("Unable to start CSC notification");
                    });
            }

            // IndoorBikeData, FitnessMachineStatus, TrainingStatus, FitnessMachineControlPoint(?)
            // If the peripheral supports IndoorBikeData notification then start listening to it
            let indoorBikeDataCharacteristic = peripheralInfo.characteristics?.find(c => c.characteristic === CharacteristicUuid.IndoorBikeData);
            if (indoorBikeDataCharacteristic && indoorBikeDataCharacteristic.properties.Notify) {
                let service = ServiceUuid.FitnessMachine;
                BleManager.startNotification(peripheralContext!.peripheral!.id, service, indoorBikeDataCharacteristic.characteristic)
                    .then(() => {
                        console.log("Test notification started")
                    }).catch(() => {
                        console.log("Unable to stop CSC notification")
                    });
            }
        }

        return (() => {
            // If we have peripheral info, clean up readers/listeners
            if (peripheralInfo) {

                // If the peripheral supports CSC measurement notification then stop listening to it
                let cscMeasurementCharacteristic = peripheralInfo.characteristics?.find(c => c.characteristic === CharacteristicUuid.CSCMeasurement);
                if (cscMeasurementCharacteristic) {
                    BleManager.stopNotification(peripheralContext!.peripheral!.id, cscMeasurementCharacteristic.service, cscMeasurementCharacteristic.characteristic)
                        .then(() => {
                            console.log("CSC notification stopped.")
                        }).catch(() => {
                            console.log("Unable to stop CSC notification");
                        });
                }

                let test = peripheralInfo.characteristics?.find(c => c.characteristic === CharacteristicUuid.IndoorBikeData);
                if (test && test.properties.Notify) {
                    let service = ServiceUuid.FitnessMachine;
                    BleManager.stopNotification(peripheralContext!.peripheral!.id, service, test.characteristic)
                        .then(() => {
                            console.log("Test notification stopped")
                        }).catch(() => {
                            console.log("Unable to stop test notification")
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
        <View style={[Style.bodyDark, { flex: 1, alignItems: "center", flexDirection: "column" }]}>

            <View style={{ flex: 1, padding: 12, flexDirection: "row", flexWrap: "wrap" }}>

                <View style={[Style.section, { minWidth: minSectionWidth, width: "auto", alignItems: "flex-end", flexGrow: 1 }]}>
                    <Text style={[Style.text, { alignSelf: "flex-start" }]}>Cadence</Text>
                    <Text style={[Style.textXXLarge]}>{cadence}</Text>
                </View>

                {indoorBikeData &&
                    <>
                        <View style={[Style.section, { minWidth: minSectionWidth , alignItems: "flex-end", flexGrow: 1 }]}>
                            <Text style={[Style.text, { alignSelf: "flex-start" }]}>Speed (mph)</Text>
                            <Text style={[Style.textXXLarge, { marginBottom: 0, paddingBottom: 0 }]}>
                                {indoorBikeData.averageSpeedMph}
                                {/* <View style={{ height: "100%" }}>
                                    <Text>mph</Text>
                                </View> */}
                            </Text>
                        </View>
                        <View style={[Style.section, { minWidth: minSectionWidth, alignItems: "flex-end", flexGrow: 1 }]}>
                            <Text style={[Style.text, { alignSelf: "flex-start" }]}>Power</Text>
                            <Text style={[Style.textXXLarge]}>{indoorBikeData.instantaneousPower}</Text>
                        </View>
                    </>
                }

            </View>


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