import { ThemedText } from "@/components/themed-text";
import { StyleSheet, View, TouchableOpacity, Alert, Text } from "react-native";
import { db } from "@/config/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useTheme } from "@/contexts/ThemeContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function Settings() {
  const { theme, activeTheme, setTheme } = useTheme();
  const [offlineMode, setOfflineMode] = useState(false);
  const [localCount, setLocalCount] = useState(0);

  useEffect(() => {
    // Offline mode'u yükle
    AsyncStorage.getItem("offlineMode").then((value) => {
      if (value === "true") setOfflineMode(true);
    });
    // Local veri sayısını güncelle
    updateLocalCount();
  }, []);

  const updateLocalCount = async () => {
    try {
      const sessions = await AsyncStorage.getItem("sessions");
      const count = sessions ? JSON.parse(sessions).length : 0;
      setLocalCount(count);
    } catch (error) {
      console.error("Local veri sayısı alınamadı:", error);
    }
  };

  // Firebase'ye senkronize et
  const syncLocalDataToFirebase = async () => {
    try {
      const localSessions = await AsyncStorage.getItem("sessions");
      if (!localSessions) {
        console.log("✅ Senkronize edilecek veri yok");
        return;
      }

      const sessions = JSON.parse(localSessions);
      const unsyncedSessions = sessions.filter((s: any) => !s.synced);

      if (unsyncedSessions.length === 0) {
        console.log("✅ Tüm veriler zaten senkronize edilmiş");
        Alert.alert("✅ Başarılı", "Tüm veriler zaten senkronize edilmiş.");
        return;
      }

      console.log(
        "☁️ Firebase'ye senkronize ediliyor:",
        unsyncedSessions.length,
        "veri"
      );

      for (const session of unsyncedSessions) {
        try {
          await addDoc(collection(db, "sessions"), {
            category: session.category,
            durationMinutes: session.durationMinutes,
            durationSeconds: session.durationSeconds,
            distractionCount: session.distractionCount,
            timestamp: Timestamp.now(),
            date: session.date,
          });
        } catch (error) {
          console.error("Veri senkronize edilemedi:", error);
          Alert.alert("❌ Hata", "Senkronizasyon sırasında hata oluştu.");
          return;
        }
      }

      // Tüm veriler başarıyla gönderildiyse, synced: true yap
      const updatedSessions = sessions.map((s: any) => ({
        ...s,
        synced: true,
      }));
      await AsyncStorage.setItem("sessions", JSON.stringify(updatedSessions));
      console.log("✅ Senkronizasyon tamamlandı!");
      Alert.alert(
        "✅ Başarılı",
        unsyncedSessions.length + " veri Firebase'ye senkronize edildi."
      );
    } catch (error) {
      console.error("Senkronizasyon hatası:", error);
      Alert.alert("❌ Hata", "Senkronizasyon başarısız oldu: " + error);
    }
  };

  const toggleOfflineMode = async () => {
    const newValue = !offlineMode;
    setOfflineMode(newValue);
    await AsyncStorage.setItem("offlineMode", newValue ? "true" : "false");

    if (newValue) {
      // Offline mod açılıyor
      Alert.alert(
        "📵 Offline Mod Açıldı",
        "Firebase'e bağlanmayacak. Veriler sadece lokal'de kaydedilecek."
      );
    } else {
      // Online mod açılıyor - senkronizasyon başla
      Alert.alert("📡 Online Mod Açıldı", "Veriler senkronize ediliyor...");
      await syncLocalDataToFirebase();
    }
  };

  const viewLocalData = async () => {
    try {
      const sessions = await AsyncStorage.getItem("sessions");
      const data = sessions ? JSON.parse(sessions) : [];
      if (data.length === 0) {
        Alert.alert("📱 Local Veriler", "Henüz kayıtlı veri yok.");
      } else {
        const summary = data
          .map(
            (s: any, i: number) =>
              `${i + 1}. ${s.category} - ${s.durationMinutes}m`
          )
          .join("\n");
        Alert.alert("📱 Local Veriler (" + data.length + ")", summary);
      }
      await updateLocalCount();
    } catch (error) {
      Alert.alert("Hata", "Local veriler okunamadı: " + error);
    }
  };

  const clearLocalData = async () => {
    Alert.alert("Uyarı", "Tüm lokal veriler silinecek. Emin misin?", [
      {
        text: "İptal",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Sil",
        onPress: async () => {
          await AsyncStorage.removeItem("sessions");
          Alert.alert("Başarılı", "Lokal veriler silindi.");
          await updateLocalCount();
        },
        style: "destructive",
      },
    ]);
  };

  const testFirebaseConnection = async () => {
    try {
      const testData = {
        test: true,
        timestamp: Timestamp.now(),
        message: "Test verisi",
      };
      const docRef = await addDoc(collection(db, "test"), testData);
      console.log("✅ Firebase bağlantı testi başarılı! ID:", docRef.id);
      Alert.alert("Başarılı!", "Firebase çalışıyor! Test ID: " + docRef.id);
    } catch (error) {
      console.error("❌ Firebase bağlantı hatası:", error);
      Alert.alert("Bağlantı Hatası", "Firebase'e bağlanılamadı: " + error);
    }
  };

  const isDark = activeTheme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#151718" : "#f5f5f5" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#ECEDEE" : "#333" }]}>
        Ayarlar
      </Text>

      {/* Tema Ayarları */}
      <View
        style={[
          styles.section,
          { backgroundColor: isDark ? "#1f2122" : "#fff" },
        ]}
      >
        <ThemedText
          style={[styles.sectionTitle, { color: isDark ? "#9BA1A6" : "#666" }]}
        >
          Tema
        </ThemedText>
        <View style={styles.themeButtons}>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === "light" && styles.themeButtonActive,
              { backgroundColor: isDark ? "#2a2d2e" : "#f0f0f0" },
            ]}
            onPress={() => setTheme("light")}
          >
            <IconSymbol
              name="sun.max.fill"
              size={24}
              color={theme === "light" ? "#FDB813" : isDark ? "#666" : "#999"}
            />
            <Text
              style={[
                styles.themeButtonText,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === "dark" && styles.themeButtonActive,
              { backgroundColor: isDark ? "#2a2d2e" : "#f0f0f0" },
            ]}
            onPress={() => setTheme("dark")}
          >
            <IconSymbol
              name="moon.fill"
              size={24}
              color={theme === "dark" ? "#4A90E2" : isDark ? "#666" : "#999"}
            />
            <Text
              style={[
                styles.themeButtonText,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === "auto" && styles.themeButtonActive,
              { backgroundColor: isDark ? "#2a2d2e" : "#f0f0f0" },
            ]}
            onPress={() => setTheme("auto")}
          >
            <IconSymbol
              name="sparkles"
              size={24}
              color={theme === "auto" ? "#9B59B6" : isDark ? "#666" : "#999"}
            />
            <Text
              style={[
                styles.themeButtonText,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              Auto
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Mod Ayarları */}
      <View
        style={[
          styles.section,
          { backgroundColor: isDark ? "#1f2122" : "#fff" },
        ]}
      >
        <ThemedText
          style={[styles.sectionTitle, { color: isDark ? "#9BA1A6" : "#666" }]}
        >
          Bağlantı
        </ThemedText>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.rowButton,
              {
                backgroundColor: isDark ? "#2a2d2e" : "#f0f0f0",
              },
            ]}
            onPress={toggleOfflineMode}
          >
            <IconSymbol
              name={offlineMode ? "wifi.slash" : "wifi"}
              size={24}
              color={offlineMode ? "#FF6B35" : "#4CAF50"}
            />
            <Text
              style={[
                styles.rowButtonLabel,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              {offlineMode ? "Offline" : "Online"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rowButton,
              {
                backgroundColor: isDark ? "#2a2d2e" : "#f0f0f0",
              },
            ]}
            onPress={viewLocalData}
          >
            <IconSymbol name="iphone" size={24} color="#2196F3" />
            <Text
              style={[
                styles.rowButtonLabel,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              Veriler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rowButton,
              {
                backgroundColor: isDark ? "#2a2d2e" : "#f0f0f0",
              },
            ]}
            onPress={clearLocalData}
          >
            <IconSymbol name="trash.fill" size={24} color="#FF9800" />
            <Text
              style={[
                styles.rowButtonLabel,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              Sil
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Firebase Test */}
      {__DEV__ && (
        <View
          style={[
            styles.section,
            { backgroundColor: isDark ? "#1f2122" : "#fff" },
          ]}
        >
          <ThemedText
            style={[
              styles.sectionTitle,
              { color: isDark ? "#9BA1A6" : "#666" },
            ]}
          >
            Geliştirici Araçları
          </ThemedText>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testFirebaseConnection}
          >
            <Text style={styles.testButtonText}>Firebase Bağlantı Testi</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 60,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  themeButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  themeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeButtonActive: {
    borderColor: "#2196F3",
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  rowButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  rowButtonLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  testButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
