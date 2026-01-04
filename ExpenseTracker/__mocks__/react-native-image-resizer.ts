export interface ResizeResult {
  uri: string;
  path: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

const createImage = jest.fn(
  (
    uri: string,
    width: number,
    height: number,
    format: string,
    quality: number,
    rotation?: number,
    outputPath?: string,
  ): Promise<ResizeResult> => {
    // Mock implementation that simulates image compression
    const originalSize = 1000000; // 1MB
    const compressionRatio = quality / 100;
    const newSize = Math.floor(originalSize * compressionRatio);

    return Promise.resolve({
      uri: `file://${outputPath || '/mock/path/resized-image.jpg'}`,
      path: outputPath || '/mock/path/resized-image.jpg',
      name: 'resized-image.jpg',
      size: newSize,
      width,
      height,
    });
  },
);

export default {
  createResizedImage: createImage,
};
