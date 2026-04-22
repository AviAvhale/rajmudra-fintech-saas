import client from './client';

export const getCourses = async () => {
  const { data } = await client.get('/api/courses');
  return data;
};

export const addCourseVideo = async (phaseNum, payload) => {
  const { data } = await client.post(`/api/courses/${phaseNum}/videos`, payload);
  return data;
};

export const updateCourseTopics = async (phaseNum, topicsList) => {
  const { data } = await client.put(`/api/courses/${phaseNum}/topics`, { topicsList });
  return data;
};

export const getCourseAnalytics = async (phaseNum) => {
  const { data } = await client.get(`/api/courses/${phaseNum}/analytics`);
  return data;
};

export const getCourseStudents = async (phaseNum) => {
  const { data } = await client.get(`/api/courses/${phaseNum}/students`);
  return data;
};

export const archiveCourse = async (phaseNum) => {
  const { data } = await client.patch(`/api/courses/${phaseNum}/archive`);
  return data;
};

export const getSettings = async () => {
  const { data } = await client.get('/api/settings');
  return data;
};

export const saveSettings = async (settings) => {
  const { data } = await client.put('/api/settings', settings);
  return data;
};

export const sendPushNotification = async (title, body) => {
  const { data } = await client.post('/api/settings/push', { title, body });
  return data;
};
