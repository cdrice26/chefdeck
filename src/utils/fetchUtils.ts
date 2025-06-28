const refreshAccessToken = async () => {
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

const request = async (url: string, method: string, body?: BodyInit) => {
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
