/**
 * Unit Tests for Axios Configuration
 * 
 * Tests axios instance configuration and interceptors.
 */

// Mock axios before importing the module
jest.mock('axios', () => {
  return {
    __esModule: true, // This is critical for default imports
    default: {
      create: jest.fn(() => ({
        interceptors: {
          request: {
            use: jest.fn()
          }
        }
      }))
    }
  };
});


describe('Axios Configuration', () => {
  let axios;
  let api;
  let useSpy;

  beforeEach(() => {
    // Reset modules to ensure fresh execution of api/axios.js
    jest.resetModules();
    localStorage.clear();

    // 1. Require axios (will use the local mock defined above)
    axios = require('axios');
    if (axios.default) axios = axios.default;

    // 2. Require the api/axios module. 
    // This executes the top-level code: const api = axios.create(...)
    try {
      api = require('../../api/axios').default;
    } catch (e) {
      console.error("Failed to require api/axios:", e);
    }

    // 3. Capture the spy from the *fresh* axios mock call
    // The previous test run failure was because we were looking at results[0] 
    // but the import might have happened before tracking or on a different instance.
    if (axios.create.mock.results[0]) {
      const axiosInstance = axios.create.mock.results[0].value;
      useSpy = axiosInstance.interceptors.request.use;
    }
  });

  it('should create axios instance with baseURL', () => {
    expect(axios.create).toHaveBeenCalled();
    const callArgs = axios.create.mock.calls[0][0];
    expect(callArgs.baseURL).toBeDefined();
  });

  it('should add Authorization header when token exists', () => {
    localStorage.setItem('token', 'test-token');

    expect(useSpy).toBeDefined();
    expect(useSpy).toHaveBeenCalled();

    // Get the interceptor function passed to use()
    const interceptorFn = useSpy.mock.calls[0][0];

    const config = {
      headers: {}
    };

    const result = interceptorFn(config);

    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not add Authorization header when token does not exist', () => {
    localStorage.removeItem('token');

    expect(useSpy).toBeDefined();
    const interceptorFn = useSpy.mock.calls[0][0];
    const config = {
      headers: {}
    };

    const result = interceptorFn(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
