import client from './client';

export const getJournalEntries = async (params = {}) => {
  const { data } = await client.get('/api/journal', { params });
  return data; // { success, entries, total }
};

export const createJournalEntry = async (payload) => {
  const { data } = await client.post('/api/journal', payload);
  return data; // { success, entry }
};

export const deleteJournalEntry = async (id) => {
  const { data } = await client.delete(`/api/journal/${id}`);
  return data;
};
