import React, { useEffect, useState } from "react";
import { Button, EmitterSubscription, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import BleManager, { Characteristic, Peripheral, PeripheralInfo } from 'react-native-ble-manager';

import { Style } from "../styles";
import { ServiceUuid } from "../enumerations/service-uuid";
import { CscMeasurement } from "../classes/csc-measurement";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export function Stats(props: NativeStackScreenProps<RootStackParamList, 'Stats'>) {
    const maxHistory = 2;

    const [peripheral, setPeripheral] = useState<Peripheral>();
    const [peripheralInfo, setPeripheralInfo] = useState<PeripheralInfo>();
    // const [cscMeasurement, setCscMeasurement] = useState<CscMeasurement>();
    const [cscMeasurements, setCscMeasurements] = useState<CscMeasurement[]>(new Array<CscMeasurement>());

    function startScan() {
        console.log("scan started");
        BleManager.scan([], 10, false);
    }

    function handleScanStop() {
        console.log("scan stopped");

        BleManager.getDiscoveredPeripherals().then((peripherals) => {
            // peripherals.forEach((p) => {
            //   console.log(`${p.name}: ${p.id}`);
            // })

            let icBike = peripherals.find(p => p.name === "IC Bike");
            if (icBike) {
                console.log("Found IC Bike. Trying to connect...");
                BleManager.connect(icBike.id).then(() => {
                    setPeripheral(icBike);
                    console.log("connected to bike");
                }).catch((error) => {
                    console.log({ error });
                });
            } else {
                console.log("No IC Bike found");
            }
        });
    }

    function handlePeripheralConnect(peripheral: Peripheral) {
        console.log("connected peripheral:");
        console.log(peripheral);

        BleManager.retrieveServices(peripheral.id).then((info) => {
            console.log("Peripheral info:", info);
        });
    }

    /**
     * Link below for value specification
     * https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.csc_measurement.xml
     * Sample: [3, 215, 2, 0, 0, 185, 51, 220, 0, 120, 217]
     * @param value 
     */
    function handleCSCMeasurementUpdate(value: any) {
        let bytes: number[] = value?.value;
        if (bytes) {
            // console.log(bytes);
            let cscMeasurement = CscMeasurement.FromBytes(bytes);
            // setCscMeasurement(cscMeasurement);

            if (cscMeasurement) {

                // TODO: Weird bug around here
                // Save CSC measurement
                if (cscMeasurements.length < maxHistory) {
                    console.log(cscMeasurements.length);
                    // setCscMeasurements(cscMeasurements.concat(cscMeasurement));
                    setCscMeasurements([...cscMeasurements, cscMeasurement]);
                } else {
                    console.log("replace");
                    setCscMeasurements([...(cscMeasurements.slice(1)), cscMeasurement]);
                    // setCscMeasurements(cscMeasurements.slice(1).concat(cscMeasurement));
                }
            }

        }
    }

    function readPeripheral() {
        if (peripheral) {
            BleManager.retrieveServices(peripheral.id, peripheral.advertising.serviceUUIDs)
                .then(info => {
                    setPeripheralInfo(info);
                    console.log({ info });


                    let characteristicsByService = new Map<string, Characteristic[]>();
                    info.services?.forEach(s => {
                        characteristicsByService.set(s.uuid, info.characteristics?.filter(c => c.service === s.uuid) || []);
                    });
                    console.log({ characteristicsByService });

                    // Read characteristics for the service uuid specified
                    // let uuid = ServiceUuid.CyclingSpeedCadence;
                    // characteristicsByService.get(uuid)?.filter(c => c.properties.Read)?.forEach(s => {
                    //   console.log({ s });
                    //   BleManager.read(peripheral.id, uuid, s.characteristic).then(r => {
                    //     if (r) {
                    //       let buffer = Buffer.from(r);
                    //       let data = buffer.toJSON();
                    //       console.log({ data });
                    //     }
                    //   });
                    // });

                });
        }
    }

    function getCadence() {
        if (cscMeasurements.length < 2) {
            return 0;
        }

        let current = cscMeasurements.at(-1);
        let previous = cscMeasurements.at(-2);

        let crankDiff = current!.cumulativeCrankRevolutions - previous!.cumulativeCrankRevolutions;
        let timeDiff = current!.lastCrankEventTime - previous!.lastCrankEventTime;

        if (crankDiff <= 0 || timeDiff <= 0) {
            // console.log({ timeDiff });
            return 0;
        }

        // Value is measured in 1/1024 of a second
        // let seconds = 1024 / timeDiff;
        // console.log(timeDiff);
        // return ((crankDiff * seconds) * 60).toPrecision(4);

        // Time value is measured in 1/1024 of a second
        // return (crankDiff / (timeDiff * 60 * 1024)).toFixed();
        return (crankDiff / (timeDiff * 60 * 1024));
    }

    useEffect(() => {
        console.log({ cscMeasurements });
    }, [cscMeasurements]);

    useEffect(() => {
        if (peripheral && peripheralInfo) {
            // Check for a CSC measurement characteristic support
            let cscMeasurementCharacteristic = peripheralInfo.characteristics?.find(c => c.characteristic === ServiceUuid.CSCMeasurement);
            // console.log(cscMeasurementCharacteristic);

            if (cscMeasurementCharacteristic) {
                BleManager.startNotification(peripheral.id, cscMeasurementCharacteristic.service, cscMeasurementCharacteristic?.characteristic)
                    .then(() => {
                        console.log("CSC notification started");
                    });

            }
        }
    }, [peripheral, peripheralInfo]);

    useEffect(() => {
        BleManager.start({ showAlert: true }).then(() => {
            console.log("Bluetooth started");
        });

        // TODO: Check permissions
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

        const scanStop: EmitterSubscription = bleManagerEmitter.addListener('BleManagerStopScan', handleScanStop);
        // const deviceDiscovered: EmitterSubscription = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDeviceDiscovered);
        const peripheralConnected: EmitterSubscription = bleManagerEmitter.addListener('BleManagerConnectPeripheral', handlePeripheralConnect);
        const notifyValueUpdated: EmitterSubscription = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleCSCMeasurementUpdate);

        return () => {
            scanStop.remove();
            // deviceDiscovered.remove();
            peripheralConnected.remove();
            notifyValueUpdated.remove();
        };
    }, []);

    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={[Style.bodyDark]}>
            <View>
                <Button title='Scan' onPress={startScan} />
            </View>

            {/* Connected device info */}
            {peripheral &&
                <View>
                    <Text>Bike found</Text>
                    <Text>Name: {peripheral.name}</Text>
                    <Text>ID: {peripheral.id}</Text>
                    <Button title='Read' onPress={readPeripheral} />
                </View>
            }

            {/* CSC measurement data */}
            {cscMeasurements.length > 1 &&
                <>
                    <View style={styles.well}>
                        <View style={[Style.section]}>
                            <Text style={Style.textLarge}>Wheel: {cscMeasurements.at(-1)?.cumulativeWheelRevolutions}</Text>
                            <Text style={Style.textLarge}>Time: {cscMeasurements.at(-1)?.lastWheelEventTime}</Text>
                        </View>
                        <View>
                            <Text style={Style.textLarge}>Crank: {cscMeasurements.at(-1)?.cumulativeCrankRevolutions}</Text>
                            <Text style={Style.textLarge}>Time: {cscMeasurements.at(-1)?.lastCrankEventTime}</Text>
                        </View>
                    </View>
                    <View style={styles.well}>
                        <View style={[Style.section]}>
                            <Text style={Style.textLarge}>Wheel: {cscMeasurements.at(-2)?.cumulativeWheelRevolutions}</Text>
                            <Text style={Style.textLarge}>Time: {cscMeasurements.at(-2)?.lastWheelEventTime}</Text>
                        </View>
                        <View>
                            <Text style={Style.textLarge}>Crank: {cscMeasurements.at(-2)?.cumulativeCrankRevolutions}</Text>
                            <Text style={Style.textLarge}>Time: {cscMeasurements.at(-2)?.lastCrankEventTime}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={{ fontSize: 128 }}>C: {getCadence()}</Text>
                    </View>
                </>
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    well: {
        backgroundColor: "#555555",
        padding: 5,
        margin: 5
    }
});
