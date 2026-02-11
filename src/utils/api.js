import { getApiUrl } from '../config/api';

/**
 * Função auxiliar para fazer requisições à API
 * Automaticamente adiciona a URL base e headers comuns
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Adicionar token JWT se existir
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  return response;
};

export default apiFetch;
