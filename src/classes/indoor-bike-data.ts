import { ByteUtil } from "../util/ByteUtil";

/**
 * Represents values in IndoorBikeData.
 * IC Bike has average speed, instantaneous power, and heart rate flags set.
 * https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.indoor_bike_data.xml
 * 
 * Example: [68, 2, 86, 4, 58, 0, 15, 0, 0]
 * 0: 0100 0100
 * 1: 0000 0010
 * 2: 0101 0110
 * 3: 0000 0100
 * 4: 0011 1010
 * 5: 0000 0000
 * 6: 0000 1111
 * 7: 0000 0000
 * 8: 0000 0000
 */
export class IndoorBikeData {
    averageSpeedMph: number = -1;
    instantaneousPower: number = -1;

    static FromBytes(bytes: number[]): IndoorBikeData {
        let result = new IndoorBikeData();

        // First two bytes are flags
        let fields = bytes.slice(2);
        if (bytes[0] === 68 && bytes[1] === 2) {
            let averageSpeedBytes = fields.slice(0, 2);
            let instantaneousPowerBytes = fields.slice(2, 4);

            let speedKph = ByteUtil.ReadUint16(averageSpeedBytes) / 100;
            let power = ByteUtil.ReadSint16(instantaneousPowerBytes);

            result.averageSpeedMph = +(speedKph * 0.6214).toFixed(1);
            result.instantaneousPower = power;
        }

        return result;
    }
}