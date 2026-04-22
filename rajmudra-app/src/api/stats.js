import client from './client';

export const getSuperAdminStats = async () => {
  const { data } = await client.get('/api/stats/superadmin');
  return data; // { success, stats }
};

export const getAdminStats = async () => {
  const { data } = await client.get('/api/stats/admin');
  return data; // { success, stats }
};

export const getUserStats = async () => {
  const { data } = await client.get('/api/stats/user');
  return data; // { success, stats: { user, announcements, batchmates } }
};

export const getAnnouncements = async () => {
  const { data } = await client.get('/api/announcements');
  return data; // { success, announcements }
};

export const createAnnouncement = async (payload) => {
  const { data } = await client.post('/api/announcements', payload);
  return data; // { success, announcement }
};

export const deleteAnnouncement = async (id) => {
  const { data } = await client.delete(`/api/announcements/${id}`);
  return data;
};
