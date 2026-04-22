import client from './client';

export const getAudits = async (params = {}) => {
  const { data } = await client.get('/api/audits', { params });
  return data; // { success, audits, total, statusCounts }
};

export const submitAudit = async (payload) => {
  const { data } = await client.post('/api/audits', payload);
  return data; // { success, audit }
};

export const reviewAudit = async (id, updates) => {
  const { data } = await client.patch(`/api/audits/${id}`, updates);
  return data; // { success, audit }
};
