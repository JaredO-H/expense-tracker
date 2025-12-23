export const launchCamera = jest.fn(() =>
  Promise.resolve({
    assets: [
      {
        uri: 'file://mock-camera-image.jpg',
        width: 1920,
        height: 1080,
        fileSize: 500000,
        type: 'image/jpeg',
        fileName: 'mock-camera-image.jpg',
      },
    ],
  })
);

export const launchImageLibrary = jest.fn(() =>
  Promise.resolve({
    assets: [
      {
        uri: 'file://mock-library-image.jpg',
        width: 1920,
        height: 1080,
        fileSize: 500000,
        type: 'image/jpeg',
        fileName: 'mock-library-image.jpg',
      },
    ],
  })
);

export default {
  launchCamera,
  launchImageLibrary,
};
