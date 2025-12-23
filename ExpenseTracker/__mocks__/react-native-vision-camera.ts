export const Camera = {
  getCameraPermissionStatus: jest.fn(() => Promise.resolve('granted')),
  requestCameraPermission: jest.fn(() => Promise.resolve('granted')),
};

export const useCameraDevice = jest.fn(() => ({
  id: 'mock-camera',
  position: 'back',
  hasFlash: true,
  hasTorch: true,
  isMultiCam: false,
  minZoom: 1,
  maxZoom: 10,
  neutralZoom: 1,
  name: 'Mock Camera',
  supportsParallelVideoProcessing: false,
  supportsFocus: true,
  supportsRawCapture: false,
  supportsLowLightBoost: false,
  formats: [],
}));

export const useCameraPermission = jest.fn(() => ({
  hasPermission: true,
  requestPermission: jest.fn(() => Promise.resolve(true)),
}));

export const CameraRuntimeError = class extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CameraRuntimeError';
  }
};

export default Camera;
