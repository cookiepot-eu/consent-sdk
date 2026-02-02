import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { APIClient, CookiePotAPIError } from '../../src/lib/api';
import type {
  SubmitConsentRequest,
  SubmitConsentResponse,
  GetConsentResponse,
} from '../../src/types';

describe('APIClient', () => {
  let client: APIClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new APIClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.com',
      timeout: 5000,
    });

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('submitConsent', () => {
    const mockRequest: SubmitConsentRequest = {
      visitorId: 'test-visitor-id',
      sessionId: 'test-session-id',
      categories: {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      },
      metadata: {
        bannerVersion: '1.0.0',
        interactionType: 'accept_selected',
        language: 'en',
      },
    };

    const mockResponse: SubmitConsentResponse = {
      consentId: 'test-consent-id',
      timestamp: '2026-01-27T12:00:00Z',
      categories: mockRequest.categories,
    };

    it('should submit consent successfully', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.submitConsent(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.test.com/v2/consent',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockRequest),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          }),
        })
      );
    });

    it('should handle 400 Bad Request', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid request payload',
          },
        }),
      });

      try {
        await client.submitConsent(mockRequest);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CookiePotAPIError);
        expect((error as CookiePotAPIError).code).toBe('INVALID_REQUEST');
        expect((error as CookiePotAPIError).statusCode).toBe(400);
      }
    });

    it('should handle 401 Unauthorized', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid API key',
          },
        }),
      });

      try {
        await client.submitConsent(mockRequest);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CookiePotAPIError);
        expect((error as CookiePotAPIError).code).toBe('UNAUTHORIZED');
        expect((error as CookiePotAPIError).statusCode).toBe(401);
      }
    });

    it('should handle 403 Forbidden', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: {
            code: 'FORBIDDEN',
            message: 'Domain not authorized',
          },
        }),
      });

      await expect(client.submitConsent(mockRequest)).rejects.toThrow(
        CookiePotAPIError
      );
    });

    it('should handle 429 Rate Limit', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
          },
        }),
      });

      try {
        await client.submitConsent(mockRequest);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CookiePotAPIError);
        expect((error as CookiePotAPIError).code).toBe('RATE_LIMIT_EXCEEDED');
        expect((error as CookiePotAPIError).statusCode).toBe(429);
      }
    });

    it('should handle 500 Internal Server Error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        }),
      });

      await expect(client.submitConsent(mockRequest)).rejects.toThrow(
        CookiePotAPIError
      );
    });

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.submitConsent(mockRequest)).rejects.toThrow(
        CookiePotAPIError
      );

      try {
        await client.submitConsent(mockRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(CookiePotAPIError);
        expect((error as CookiePotAPIError).code).toBe('NETWORK_ERROR');
      }
    });

    it('should handle timeout', async () => {
      const slowClient = new APIClient({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.test.com',
        timeout: 50,
      });

      // Mock fetch to reject with AbortError
      fetchMock.mockRejectedValue(
        Object.assign(new Error('The operation was aborted'), {
          name: 'AbortError',
        })
      );

      try {
        await slowClient.submitConsent(mockRequest);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CookiePotAPIError);
        expect((error as CookiePotAPIError).code).toBe('REQUEST_TIMEOUT');
      }
    });

    it('should handle non-JSON error responses', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      try {
        await client.submitConsent(mockRequest);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(CookiePotAPIError);
        expect((error as CookiePotAPIError).code).toBe('UNKNOWN_ERROR');
      }
    });
  });

  describe('getConsentHistory', () => {
    const mockResponse: GetConsentResponse = {
      visitorId: 'test-visitor-id',
      latestConsent: {
        consentId: 'latest-id',
        timestamp: '2026-01-27T12:00:00Z',
        categories: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: true,
        },
      },
      consentHistory: [
        {
          consentId: 'latest-id',
          timestamp: '2026-01-27T12:00:00Z',
          categories: {
            necessary: true,
            analytics: true,
            marketing: false,
            preferences: true,
          },
        },
      ],
    };

    it('should get consent history successfully', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getConsentHistory('test-visitor-id');

      expect(result).toEqual(mockResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.test.com/v2/consent/test-visitor-id',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          }),
        })
      );
    });

    it('should handle 404 Not Found', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            code: 'NOT_FOUND',
            message: 'Visitor not found',
          },
        }),
      });

      await expect(
        client.getConsentHistory('unknown-visitor')
      ).rejects.toThrow(CookiePotAPIError);
    });
  });
});
