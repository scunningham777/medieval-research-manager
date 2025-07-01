import axios from 'axios';
import type { Source, CreateSourceInput } from '../types/source';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchSources = async (): Promise<Source[]> => {
  try {
    const response = await api.get<Source[]>('/sources');
    return response.data;
  } catch (error) {
    console.error('Error fetching sources:', error);
    throw error;
  }
};

export const createSource = async (sourceData: CreateSourceInput): Promise<Source> => {
  try {
    const response = await api.post<Source>('/sources', sourceData);
    return response.data;
  } catch (error) {
    console.error('Error creating source:', error);
    throw error;
  }
};

export const updateSource = async (id: string, sourceData: Partial<Source>): Promise<Source> => {
  try {
    const response = await api.put<Source>(`/sources/${id}`, sourceData);
    return response.data;
  } catch (error) {
    console.error('Error updating source:', error);
    throw error;
  }
};

export const deleteSource = async (id: string): Promise<void> => {
  try {
    await api.delete(`/sources/${id}`);
  } catch (error) {
    console.error('Error deleting source:', error);
    throw error;
  }
};
