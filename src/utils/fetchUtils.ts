const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const res = await fetch('/api/auth/refreshToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-refresh-token': refreshToken
    }
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (data.accessToken && data.refreshToken) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  }
  return null;
};

const request = async (url: string, method: string, body?: BodyInit) => {
  if (typeof window === 'undefined') {
    throw new Error('request() called on the server');
  }

  let accessToken = localStorage.getItem('accessToken') ?? '';

  let res = await fetch(url, {
    method,
    body,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
  });

  if (res.status === 401) {
    // Try to refresh token
    accessToken = await refreshAccessToken();
    if (accessToken) {
      res = await fetch(url, {
        method,
        body,
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });
    }
  }

  return res;
};

export default request;
