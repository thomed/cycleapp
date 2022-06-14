import React from 'react';
import { Pressable, Text, TouchableHighlight, View } from "react-native";
import { Peripheral } from "react-native-ble-manager";

interface PeripheralCardProps {
    peripheral: Peripheral,
    onPress: (peripheral: Peripheral) => void
}

export function PeripheralCard(props: PeripheralCardProps) {
    const { peripheral, onPress } = props;

    function handlePress() {
        onPress(peripheral);
    }

    return (
        <TouchableHighlight onPress={handlePress} >
            <View>
                <Text>{peripheral.name}</Text>
                <Text>{peripheral.id}</Text>
            </View>
        </TouchableHighlight>
    );
}