import { ByteUtil } from "../util/ByteUtil";

/**
 * Represents the values in a CSC Measurement.
 * https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.csc_measurement.xml
 */
export class CscMeasurement {
    cumulativeWheelRevolutions: number = -1;
    lastWheelEventTime: number = -1;
    cumulativeCrankRevolutions: number = -1;
    lastCrankEventTime: number = -1;

    /**
     * Used to initialize a CscMeasurment object using the bytes read from a bluetooth peripheral.
     * @param bytes Array of byte values
     */
    static FromBytes(bytes: number[]): CscMeasurement {
        let result = new CscMeasurement();

        // 2 'LSBs' are flags for this data being present (see spec)
        if (bytes[0] === 3) {
            let cumulativeWheelRevBytes = bytes.slice(1, 5);
            let lastWheelTimeBytes = bytes.slice(5, 7);
            let cumulativeCrankRevBytes = bytes.slice(7, 9);
            let lastCrankTimeBytes = bytes.slice(9);

            result.cumulativeWheelRevolutions = ByteUtil.ReadUint32(cumulativeWheelRevBytes);
            result.lastWheelEventTime = ByteUtil.ReadUint16(lastWheelTimeBytes);
            result.cumulativeCrankRevolutions = ByteUtil.ReadUint16(cumulativeCrankRevBytes);
            result.lastCrankEventTime = ByteUtil.ReadUint16(lastCrankTimeBytes);
        }

        return result;
    }
}