const refreshAccessToken = async () => {
  const res = await fetch('/api/auth/refreshToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  if (!res.ok) {
    return false;
  }
  return true;
};

const request = async (url: string, method: string, body?: BodyInit) => {
  if (typeof window === 'undefined') {
    throw new Error('request() called on the server');
  }

  let res = await fetch(url, {
    method,
    body,
    credentials: 'include'
  });

  if (res.status === 401) {
    // Try to refresh token
    const accessToken = await refreshAccessToken();
    if (accessToken) {
      res = await fetch(url, {
        method,
        body,
        credentials: 'include'
      });
    }
  }

  return res;
};

export default request;
