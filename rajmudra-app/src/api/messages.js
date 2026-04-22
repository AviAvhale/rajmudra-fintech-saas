import client from './client';

export const getConversations = async () => {
  const { data } = await client.get('/api/messages/conversations');
  return data; // { success, conversations: [{ partner, lastMessage, unread }] }
};

export const getMessages = async (userId) => {
  const { data } = await client.get(`/api/messages/${userId}`);
  return data; // { success, messages }
};

export const sendMessage = async (userId, text) => {
  const { data } = await client.post(`/api/messages/${userId}`, { text });
  return data; // { success, message }
};

export const markAsRead = async (userId) => {
  const { data } = await client.patch(`/api/messages/read/${userId}`);
  return data;
};
