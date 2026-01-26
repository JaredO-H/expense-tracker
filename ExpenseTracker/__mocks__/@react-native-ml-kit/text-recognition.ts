export interface TextRecognitionResult {
  text: string;
  blocks: Array<{
    text: string;
    lines: Array<{
      text: string;
      elements: Array<{
        text: string;
      }>;
    }>;
  }>;
}

const recognize = jest.fn((_imagePath: string): Promise<TextRecognitionResult> => {
  // Default mock OCR result
  return Promise.resolve({
    text: 'MOCK RECEIPT\nTOTAL: $50.00\nDATE: 2024-03-15\nTAX: $4.00',
    blocks: [
      {
        text: 'MOCK RECEIPT',
        lines: [
          {
            text: 'MOCK RECEIPT',
            elements: [{ text: 'MOCK' }, { text: 'RECEIPT' }],
          },
        ],
      },
      {
        text: 'TOTAL: $50.00',
        lines: [
          {
            text: 'TOTAL: $50.00',
            elements: [{ text: 'TOTAL:' }, { text: '$50.00' }],
          },
        ],
      },
    ],
  });
});

export default {
  recognize,
};
