
// src/api/csharp.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5120', // ← порт, на котором сейчас запущен твой C# бэкенд
  timeout: 10000,
});

// Универсальная функция — вызывает ЛЮБОЙ твой C# сервис и метод
export const call = async <T = any>(
  service: string,     // например: "MyApp.Services.TrackService"
  method: string,      // например: "GetUserTracksAsync"
  params?: any         // любой объект или null
): Promise<T> => {
  const response = await api.post('/call', {
    Service: service,
    Method: method,
    Parameters: params ? [params] : []
  });
  return response.data;
};