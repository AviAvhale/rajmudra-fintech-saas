import client from './client';

export const getLiveSessions = async () => {
  const { data } = await client.get('/api/livesessions');
  return data; // { success, live, upcoming, ended }
};

export const createLiveSession = async (payload) => {
  const { data } = await client.post('/api/livesessions', payload);
  return data;
};

export const startLiveSession = async (id) => {
  const { data } = await client.patch(`/api/livesessions/${id}/start`);
  return data;
};

export const endLiveSession = async (id, duration) => {
  const { data } = await client.patch(`/api/livesessions/${id}/end`, { duration });
  return data;
};

export const getDailyAnalyses = async () => {
  const { data } = await client.get('/api/analysis');
  return data; // { success, analyses }
};

export const createAnalysis = async (payload) => {
  const { data } = await client.post('/api/analysis', payload);
  return data;
};

export const toggleAnalysisLike = async (id) => {
  const { data } = await client.patch(`/api/analysis/${id}/like`);
  return data; // { success, liked, likes }
};
