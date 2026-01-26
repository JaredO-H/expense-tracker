const mockFileSystem: Record<string, string> = {};

const RNFS = {
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
  ExternalDirectoryPath: '/mock/external',
  TemporaryDirectoryPath: '/mock/temp',

  writeFile: jest.fn((filepath: string, contents: string, _encoding?: string) => {
    mockFileSystem[filepath] = contents;
    return Promise.resolve();
  }),

  readFile: jest.fn((filepath: string, _encoding?: string) => {
    const contents = mockFileSystem[filepath];
    if (contents === undefined) {
      return Promise.reject(new Error('File not found'));
    }
    return Promise.resolve(contents);
  }),

  readDir: jest.fn((_dirpath: string) => {
    return Promise.resolve([]);
  }),

  stat: jest.fn((filepath: string) => {
    const contents = mockFileSystem[filepath];
    if (contents === undefined) {
      return Promise.reject(new Error('File not found'));
    }
    return Promise.resolve({
      size: contents.length,
      isFile: () => true,
      isDirectory: () => false,
      mtime: new Date(),
      ctime: new Date(),
    });
  }),

  exists: jest.fn((filepath: string) => {
    return Promise.resolve(mockFileSystem[filepath] !== undefined);
  }),

  unlink: jest.fn((filepath: string) => {
    delete mockFileSystem[filepath];
    return Promise.resolve();
  }),

  mkdir: jest.fn((_filepath: string) => {
    return Promise.resolve();
  }),

  moveFile: jest.fn((from: string, to: string) => {
    if (mockFileSystem[from] !== undefined) {
      mockFileSystem[to] = mockFileSystem[from];
      delete mockFileSystem[from];
    }
    return Promise.resolve();
  }),

  copyFile: jest.fn((from: string, to: string) => {
    if (mockFileSystem[from] !== undefined) {
      mockFileSystem[to] = mockFileSystem[from];
    }
    return Promise.resolve();
  }),

  // Helper for tests
  __getMockFileSystem: () => mockFileSystem,
  __clearMockFileSystem: () => {
    Object.keys(mockFileSystem).forEach(key => delete mockFileSystem[key]);
  },
};

export default RNFS;
