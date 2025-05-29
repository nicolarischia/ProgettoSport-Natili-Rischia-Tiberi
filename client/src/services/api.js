import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const getDrivers = async () => {
  try {
    const response = await api.get('/drivers');
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei piloti:', error);
    throw error;
  }
};

export const getRaces = async () => {
  try {
    const response = await api.get('/races');
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle gare:', error);
    throw error;
  }
};

export const getTeams = async () => {
  try {
    const response = await api.get('/teams');
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei team:', error);
    throw error;
  }
};

export const getLapTimes = async (sessionId) => {
  try {
    const response = await api.get(`/laptimes/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei tempi sul giro:', error);
    throw error;
  }
};

export const getDriverStats = async (driverId) => {
  try {
    const response = await api.get(`/driver-stats/${driverId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero delle statistiche del pilota:', error);
    throw error;
  }
};

export const getRaceResults = async (sessionId) => {
  try {
    const response = await api.get(`/race-results/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei risultati della gara:', error);
    throw error;
  }
}; 