import axios from 'axios';

// ⚠️ Update this URL based on your setup:
// - iOS Simulator:        http://localhost:3000/trains
// - Android Emulator:     http://10.0.2.2:3000/trains
// - Physical Device:      http://YOUR_LAN_IP:3000/trains  (e.g. http://192.168.1.5:3000/trains)
const BASE_URL = 'https://railmind.onrender.com/trains';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const getTrainByNo = async (trainNo) => {
  const response = await api.get(`/getTrain?trainNo=${trainNo}`);
  return response.data;
};

export const getTrainsBetweenStations = async (from, to) => {
  const response = await api.get(`/betweenStations?from=${from}&to=${to}`);
  return response.data;
};

export const getTrainsOnDate = async (from, to, date) => {
  // date format: DD-MM-YYYY
  const response = await api.get(`/getTrainOn?from=${from}&to=${to}&date=${date}`);
  return response.data;
};

export const getTrainRoute = async (trainNo) => {
  const response = await api.get(`/getRoute?trainNo=${trainNo}`);
  return response.data;
};

export const getStationLive = async (code) => {
  const response = await api.get(`/stationLive?code=${code}`);
  return response.data;
};

export const getPNRStatus = async (pnr) => {
  const response = await api.get(`/pnrstatus?pnr=${pnr}`);
  return response.data;
};
