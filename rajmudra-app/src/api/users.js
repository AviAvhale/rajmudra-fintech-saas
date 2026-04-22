import client from './client';

export const getUsers = async ({ page = 1, limit = 20, role, search } = {}) => {
  const params = { page, limit };
  if (role) params.role = role;
  if (search) params.search = search;
  const { data } = await client.get('/api/users', { params });
  return data; // { success, users, total, page, pages }
};

export const getMyProfile = async () => {
  const { data } = await client.get('/api/users/me');
  return data; // { success, user }
};

export const updateMyProfile = async (updates) => {
  const { data } = await client.patch('/api/users/me', updates);
  return data; // { success, user }
};

export const getStudents = async ({ search, limit = 50 } = {}) => {
  const params = { limit };
  if (search) params.search = search;
  const { data } = await client.get('/api/users/students', { params });
  return data; // { success, students, total }
};

export const updateUser = async (id, updates) => {
  const { data } = await client.patch(`/api/users/${id}`, updates);
  return data; // { success, user }
};

export const deleteUser = async (id) => {
  const { data } = await client.delete(`/api/users/${id}`);
  return data;
};
