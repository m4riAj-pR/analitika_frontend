// api/config.js
import Constants from "expo-constants";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (__DEV__) {
    const extraUrl = Constants.expoConfig?.extra?.apiUrl;
    if (extraUrl) return extraUrl;
    
    if (Platform.OS === "android") {
      return "http://10.0.2.2:8000";
    }
    return "http://localhost:8000";
  }
  return "https://tu-api.com"; // producción
};

export const API_BASE_URL = getBaseUrl();
export const API_TIMEOUT = 10000;
export const TOKEN_KEY = 'analitika_token';