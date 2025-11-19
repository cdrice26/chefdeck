/**
 * Attempt to refresh the current access token by calling the refresh endpoint.
 *
 * This helper calls the client-side refresh endpoint which is expected to set
 * a new access token via cookies when successful.
 *
 * @returns Promise resolving to `true` when the refresh succeeded and `false` otherwise.
 */
const refreshAccessToken = async (): Promise<boolean> => {
  const res = await fetch('/api/auth/refreshToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'web'
    },
    credentials: 'include'
  });

  if (!res.ok) {
    return false;
  }
  return true;
};

/**
 * Perform a fetch request with automatic token refresh on 401 responses.
 *
 * The function will perform the request, and if a 401 is encountered it will
 * attempt to refresh the access token once and then retry the original request.
 *
 * @param url - URL or path to request.
 * @param method - HTTP method to use (e.g. 'GET', 'POST').
 * @param body - Optional request body to send (for POST/PUT requests).
 * @returns The fetch `Response` object returned by the request (possibly after a retry).
 */
const request = async (
  url: string,
  method: string,
  body?: BodyInit
): Promise<Response> => {
  let res = await fetch(url, {
    method,
    body,
    credentials: 'include',
    headers: {
      'X-Client-Type': 'web'
    }
  });

  if (res.status === 401) {
    // Try to refresh token
    const accessToken = await refreshAccessToken();
    if (accessToken) {
      res = await fetch(url, {
        method,
        body,
        credentials: 'include',
        headers: {
          'X-Client-Type': 'web'
        }
      });
    }
  }

  return res;
};

export default request;
