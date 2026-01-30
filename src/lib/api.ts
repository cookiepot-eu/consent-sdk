import type {
  SubmitConsentRequest,
  SubmitConsentResponse,
  GetConsentResponse,
  APIError,
} from '../types';

/**
 * API Client Configuration
 */
export interface APIClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

/**
 * API Error Class
 */
export class CookiePotAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'CookiePotAPIError';
  }
}

/**
 * API Client for CookiePot backend
 */
export class APIClient {
  private config: Required<APIClientConfig>;

  constructor(config: APIClientConfig) {
    this.config = {
      ...config,
      timeout: config.timeout ?? 5000,
    };
  }

  /**
   * Submit consent to the backend
   */
  async submitConsent(
    request: SubmitConsentRequest
  ): Promise<SubmitConsentResponse> {
    return this.request<SubmitConsentResponse>('/v1/consent', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get consent history for a visitor
   */
  async getConsentHistory(visitorId: string): Promise<GetConsentResponse> {
    return this.request<GetConsentResponse>(`/v1/consent/${visitorId}`, {
      method: 'GET',
    });
  }

  /**
   * Make an HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle successful responses
      if (response.ok) {
        return (await response.json()) as T;
      }

      // Handle error responses
      let errorData: APIError;
      try {
        errorData = (await response.json()) as APIError;
      } catch {
        throw new CookiePotAPIError(
          'UNKNOWN_ERROR',
          'An unknown error occurred',
          response.status
        );
      }

      throw new CookiePotAPIError(
        errorData.error.code,
        errorData.error.message,
        response.status
      );
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle CookiePotAPIError (already processed)
      if (error instanceof CookiePotAPIError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new CookiePotAPIError(
            'REQUEST_TIMEOUT',
            `Request timeout after ${this.config.timeout}ms`
          );
        }

        throw new CookiePotAPIError('NETWORK_ERROR', error.message);
      }

      // Unknown error
      throw new CookiePotAPIError(
        'UNKNOWN_ERROR',
        'An unknown error occurred'
      );
    }
  }
}

/**
 * Create an API client instance
 */
export function createAPIClient(config: APIClientConfig): APIClient {
  return new APIClient(config);
}
