import { StyleSheet } from "react-native";
import { Window } from ".";
import { colors, nums } from "./default";

export const StatsStyle = StyleSheet.create({
    infoCard: {
        minWidth: Window.width / 2,
        maxWidth: "100%",
        width: "auto",
        alignItems: "flex-end",
        flexGrow: 1,
        borderWidth: nums.borderWidth,
        borderColor: colors.fontMedium,
        borderRadius: nums.borderRadius
    },
    infoCardFg: {
        padding: nums.spaceMedium,
        width: "100%"
    },
    infoTitle: {
        color: colors.fontLight,
        alignSelf: "flex-start",
        borderBottomWidth: nums.borderWidth,
        borderBottomColor: colors.fontMedium
    },
    infoValue: {
        color: colors.fontLight,
        alignSelf: "flex-end"
    }
}); 
