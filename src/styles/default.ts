import { Dimensions, StyleSheet } from "react-native";

export const colors = {
    bgHeader: "#363636",
    bgMedium: "#555555",
    bgDark: "#292929",
    fontLight: "#dddddd",
    fontMedium: "#6a6a6a"
};

export const nums = {
    borderRadius: 3,
    borderWidth: 2,
    fontNormal: 20,
    fontLarge: 32,
    fontXLarge: 64,
    fontXXLarge: 128,
    fontXtreme: 256,
    spaceMedium: 5,
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
