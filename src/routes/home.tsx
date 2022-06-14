import React, { useContext } from "react";
import { Text, View } from "react-native";
import { Peripheral } from "react-native-ble-manager";
import Svg, { SvgUri } from "react-native-svg";

import { PeripheralContext } from "../../App";
import { Style } from "../styles";

import BluetoothIcon from "../assets/icons/bluetooth-outline.svg";
import { Accordion, Container, Content, Header } from "native-base";

export function Home(props: any) {
    const peripheralContext = useContext(PeripheralContext)!;
    const iconColor = peripheralContext.peripheral ? "cyan" : "gray";

    const dataArray = [
        // { title: "ASDF", content: "QWERTYYY" }
        "ASDF"
    ];

    return (
        <View style={[Style.bodyDark, { flex: 1, alignItems: 'center' }]}>
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
        </View>
    );
}
