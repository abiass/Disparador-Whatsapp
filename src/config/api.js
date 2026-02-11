/**
 * Configuração da API
 * Utiliza variáveis de ambiente do Vite
 */

// URL base da API (backend)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// URL do WebSocket
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

// Função auxiliar para construir URLs da API
export const getApiUrl = (endpoint) => {
  // Remove barra inicial se existir
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};

// Função auxiliar para construir URL do WebSocket
export const getWsUrl = () => {
  return WS_URL;
};

export default {
  API_URL,
  WS_URL,
  getApiUrl,
  getWsUrl,
};
