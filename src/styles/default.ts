import { Dimensions, StyleSheet } from "react-native";

let Window = Dimensions.get("window");

const colors = {
    bgHeader: "#363636",
    bgMedium: "#555555",
    bgDark: "#292929",
    fontLight: "#dddddd"
};

const nums = {
    spaceMedium: 5,
    fontNormal: 24,
    fontLarge: 32,
    fontXLarge: 64,
    fontXXLarge: 128,
    fontXtreme: 256
}

export const Style = StyleSheet.create({
    bodyDark: {
        backgroundColor: colors.bgDark
    },
    headerMain: {
        backgroundColor: colors.bgHeader
    },
    headerTitle: {
        color: colors.fontLight
    },
    section: {
        margin: nums.spaceMedium
    },
    text: {
        fontSize: nums.fontNormal
    },
    textLarge: {
        fontSize: nums.fontLarge
    },
    textXLarge: {
        fontSize: nums.fontXLarge
    },
    textXXLarge: {
        fontSize: nums.fontXXLarge
    },
    textXtreme: {
        fontSize: nums.fontXtreme
    },
    well: {
        backgroundColor: colors.bgMedium,
        padding: nums.spaceMedium,
        margin: nums.spaceMedium
    }
});
