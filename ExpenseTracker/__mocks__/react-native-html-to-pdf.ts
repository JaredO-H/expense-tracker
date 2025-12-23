export interface PDFOptions {
  html: string;
  fileName: string;
  directory?: string;
  base64?: boolean;
  width?: number;
  height?: number;
  padding?: number;
  bgColor?: string;
}

export interface PDFResult {
  filePath: string;
  numberOfPages?: number;
  base64?: string;
}

const RNHTMLtoPDF = {
  convert: jest.fn((options: PDFOptions): Promise<PDFResult> => {
    const filePath = `${options.directory || '/mock/documents'}/${options.fileName}`;

    return Promise.resolve({
      filePath,
      numberOfPages: 1,
      base64: options.base64 ? 'mock-base64-content' : undefined,
    });
  }),
};

export default RNHTMLtoPDF;
