import client from './client';

export const getTickets = async (params = {}) => {
  const { data } = await client.get('/api/tickets', { params });
  return data; // { success, tickets, total, statusCounts }
};

export const createTicket = async (payload) => {
  const { data } = await client.post('/api/tickets', payload);
  return data; // { success, ticket }
};

export const updateTicket = async (id, updates) => {
  const { data } = await client.patch(`/api/tickets/${id}`, updates);
  return data; // { success, ticket }
};
