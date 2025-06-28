import axios from 'axios';
import type { Source } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sourceAPI = {
  getAll: () => api.get<Source[]>('/sources'),
  getById: (id: string) => api.get<Source>(`/sources/${id}`),
  create: (source: Omit<Source, 'id'>) => api.post<Source>('/sources', source),
  update: (id: string, source: Partial<Source>) => api.put<Source>(`/sources/${id}`, source),
  delete: (id: string) => api.delete(`/sources/${id}`),
};
