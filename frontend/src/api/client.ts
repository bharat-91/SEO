import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let client: AxiosInstance;

export function initializeApiClient(): AxiosInstance {
  client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return client;
}

export function getApiClient(): AxiosInstance {
  if (!client) {
    return initializeApiClient();
  }
  return client;
}
