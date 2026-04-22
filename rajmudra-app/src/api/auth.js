import client from './client';

export const loginApi = async (email, password) => {
  const { data } = await client.post('/api/auth/login', { email, password });
  // Save token to localStorage as fallback for LAN/HTTP (cookies may not work cross-port)
  if (data.token) localStorage.setItem('rm_token', data.token);
  return data; // { success, user, token }
};

export const registerApi = async (formData) => {
  const { data } = await client.post('/api/auth/register', formData);
  if (data.token) localStorage.setItem('rm_token', data.token);
  return data; // { success, user, token }
};

export const logoutApi = async () => {
  const { data } = await client.post('/api/auth/logout');
  localStorage.removeItem('rm_token');
  return data;
};

export const getMeApi = async () => {
  const { data } = await client.get('/api/auth/me');
  return data; // { success, user }
};
