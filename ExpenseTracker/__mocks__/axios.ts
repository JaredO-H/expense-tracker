const axios: any = {
  create: jest.fn(function () {
    return axios;
  }),

  get: jest.fn(() => Promise.resolve({ data: {} })),

  post: jest.fn(() => Promise.resolve({ data: {} })),

  put: jest.fn(() => Promise.resolve({ data: {} })),

  delete: jest.fn(() => Promise.resolve({ data: {} })),

  patch: jest.fn(() => Promise.resolve({ data: {} })),

  request: jest.fn(() => Promise.resolve({ data: {} })),

  defaults: {
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {},
    },
  },

  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
};

export default axios;
