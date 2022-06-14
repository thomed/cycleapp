import { Buffer } from 'buffer';

export class ByteUtil {

    /**
     * Read uint16 bytes into a number.
     * @param bytes 
     * @returns 
     */
    static ReadUint16(bytes: number[]): number {
        let buffer = Buffer.from(bytes);
        return buffer.readUInt16LE();
    }

    /**
     * Read uint32 bytes into a number.
     * @param bytes 
     * @returns 
     */
    static ReadUint32(bytes: number[]): number {
        let buffer = Buffer.from(bytes);
        return buffer.readUInt32LE();
    }
}