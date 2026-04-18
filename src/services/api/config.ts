// api/config.js
import Constants from "expo-constants";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "ios") {
      return (
        Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:8000"
      );
    }
  }
  return "https://tu-api.com"; // producción
};

export const API_BASE_URL = getBaseUrl();
export const API_TIMEOUT = 10000;
export const TOKEN_KEY = 'analitika_token';