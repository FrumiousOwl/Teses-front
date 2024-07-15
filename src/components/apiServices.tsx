/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/apiService.ts

import axios from 'axios';

// Create an Axios instance with base URL and headers
const apiClient = axios.create({
  baseURL: 'https://your-backend-api-url.com/api/', // Replace with your backend API base URL
  headers: {
    'Content-Type': 'application/json',
    // Add any headers like authentication tokens if needed
  },
});

// Define functions to interact with your backend API
export const getAssets = async () => {
  try {
    const response = await apiClient.get('/assets');
    return response.data; // Assuming your backend returns JSON data
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
};

export const addAsset = async (assetData: any) => {
  try {
    const response = await apiClient.post('/assets', assetData);
    return response.data;
  } catch (error) {
    console.error('Error adding asset:', error);
    throw error;
  }
};

// Add other CRUD operations as needed (update, delete, etc.)
