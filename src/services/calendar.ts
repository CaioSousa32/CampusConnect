import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, ToastAndroid } from "react-native";

const CALENDAR_URL =
  "https://raw.githubusercontent.com/CaioSousa32/campus-connect-data/main/calendario.json";

const STORAGE_KEY = "@calendar_data";
const STORAGE_DATE_KEY = "@calendar_last_update";

export const fetchCalendar = async () => {
  try {
    console.log("🔍 Verificando atualizações do calendário...");

    // Carrega cache
    const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
    const cachedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);

    let parsedCache = cachedData ? JSON.parse(cachedData) : null;

    // Tenta baixar o conteúdo remoto
    const response = await fetch(CALENDAR_URL, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (!response.ok) {
      console.log("⚠️ Falha ao baixar remoto — usando cache, pois response.ok === false");
      if (parsedCache) {
        return { data: parsedCache, lastUpdate: cachedDate, fromCache: true };
      }
      return null;
    }

    const remoteData = await response.json();

    // Agora comparamos APENAS as datas
    if (cachedDate && cachedDate === remoteData.lastUpdate) {
      console.log("✅ Nenhuma atualização — lastUpdate igual ao cache");
      return {
        title: parsedCache?.title,
        data: parsedCache?.events || [],
        lastUpdate: cachedDate,
        fromCache: true,
      };
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
    await AsyncStorage.setItem(STORAGE_DATE_KEY, remoteData.lastUpdate);


    console.log("📥 Atualização encontrada e salva");
    return {
      title: remoteData.title,
      data: remoteData.events,
      lastUpdate: remoteData.lastUpdate,
      fromCache: false,
    };


  } catch (error) {
    console.error("❌ Erro ao verificar calendário:", error);

    // Tentar usar cache
    const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
    const cachedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);

    if (cachedData) {
      console.log("📦 Sem internet — usando cache salvo");
      const parsedCache = JSON.parse(cachedData);

      return {
        title: parsedCache?.title,
        data: parsedCache?.events || [],
        lastUpdate: cachedDate || null,
        fromCache: true,
      };
    }

    // 📢 Sem internet E sem cache → avisar o usuário
    if (Platform.OS === "android") {
      ToastAndroid.show(
        "Sem conexão. Conecte-se à internet para carregar o calendário.",
        ToastAndroid.SHORT
      );
    }

    return null;
  }

};
