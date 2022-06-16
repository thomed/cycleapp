/**
 * https://btprodspecificationrefs.blob.core.windows.net/assigned-values/16-bit%20UUID%20Numbers%20Document.pdf
 */
export enum CharacteristicUuid {
    DeviceName = "2a00",
    Appearance = "2a01",
    PeripheralPreferredConnectionParameters = "2a04",
    CentralAddressResolution = "2aa6",
    ModelNumberString = "2a24",
    FirmwareRevisionString = "2a26",
    HardwareRevisionString = "2a27",
    SoftwareRevisionString = "2a28",
    ManufacturerNameString = "2a29",
    PnPID = "2a50",
    HeartRateMeasurement = "2a37",
    BodySensorLocation = "2a38",
    SCControlPoint = "2a55",
    CSCMeasurement = "2a5b",
    SensorLocation = "2a5d",
    FitnessMachineFeature = "2acc",
    IndoorBikeData = "2ad2",
    FitnessMachineStatus = "2ada",
    TrainingStatus = "2ad3",
    FitnessMachineControlPoint = "2ad9"
}