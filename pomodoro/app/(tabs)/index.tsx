import { ThemedText } from "@/components/themed-text";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  AppState,
  AppStateStatus,
  Text,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation } from "expo-router";
import { db } from "@/config/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as ScreenOrientation from "expo-screen-orientation";

type SessionStatus = "idle" | "running" | "paused";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === "dark";
  const [duration, setDuration] = useState(25); // Dakika cinsinden
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Saniye cinsinden
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [category, setCategory] = useState("Ders Çalışma");
  const [distractionCount, setDistractionCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [completedTime, setCompletedTime] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState([
    "Ders Çalışma",
    "Kodlama",
    "Proje",
    "Kitap Okuma",
  ]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const statusRef = useRef<SessionStatus>("idle");
  const timeLeftRef = useRef(timeLeft);

  // Kategorileri AsyncStorage'dan yükle
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedCategories = await AsyncStorage.getItem("categories");
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        }
      } catch (error) {
        console.error("Kategoriler yüklenemedi:", error);
      }
    };
    loadCategories();
  }, []);

  const handleComplete = React.useCallback(() => {
    const completedSeconds = duration * 60 - timeLeft;
    setCompletedTime(completedSeconds);
    setShowSummary(true);
    setStatus("idle");
  }, [duration, timeLeft]);

  useEffect(() => {
    if (status === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, timeLeft, duration, handleComplete]);

  useEffect(() => {
    statusRef.current = status;
    timeLeftRef.current = timeLeft;
  }, [status, timeLeft]);

  // Ekran yönünü kontrol et ve tab bar'ı gizle/göster
  useEffect(() => {
    const changeOrientation = async () => {
      if (status === "running" || status === "paused") {
        // Timer başladığında veya duraklatıldığında landscape (yatay) moda geç ve tab bar'ı gizle
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        navigation.setOptions({
          tabBarStyle: { display: "none" },
        });
      } else if (status === "idle") {
        // Timer durdurulunca portrait (dikey) moda geri dön ve tab bar'ı göster
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        // Varsayılan sekme çubuğu stiline geri dön
        navigation.setOptions({ tabBarStyle: undefined });
      }
    };
    changeOrientation();
  }, [status, navigation]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const prevState = appState.current;
        appState.current = nextState;

        const wentBackground =
          prevState === "active" &&
          (nextState === "background" || nextState === "inactive");

        if (wentBackground && statusRef.current === "running") {
          setDistractionCount((prev) => prev + 1);
          setStatus("paused");
        }

        if (
          (prevState === "background" || prevState === "inactive") &&
          nextState === "active"
        ) {
          if (statusRef.current === "paused" && timeLeftRef.current > 0) {
            Alert.alert("Devam edilsin mi?", "Zamanlayıcı duraklatıldı.", [
              { text: "Hayır", style: "cancel" },
              { text: "Devam", onPress: () => setStatus("running") },
            ]);
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleStart = () => {
    if (status === "idle") {
      setTimeLeft(duration * 60);
      setDistractionCount(0);
    }
    setStatus("running");
  };

  const handlePause = () => {
    setStatus("paused");
  };

  const handleReset = () => {
    setStatus("idle");
    setTimeLeft(duration * 60);
    setDistractionCount(0);
  };

  const handleShowSummary = async () => {
    const completedSeconds = duration * 60 - timeLeft;
    setCompletedTime(completedSeconds);
    // Önce status'u paused yap ki orientation ve tab bar düzgün ayarlansın
    setStatus("paused");
    // Orientation'u portrait'e döndür ve tab bar'ı göster
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
    navigation.setOptions({
      tabBarStyle: { display: "flex" },
    });
    setShowSummary(true);
  };

  const saveSessionToFirebase = async () => {
    try {
      // Offline mod'u kontrol et
      const offlineMode = await AsyncStorage.getItem("offlineMode");
      const isOffline = offlineMode === "true";

      const completedSeconds = duration * 60 - timeLeft;
      const sessionData = {
        category,
        durationMinutes: Math.floor(completedSeconds / 60),
        durationSeconds: completedSeconds % 60,
        distractionCount,
        timestamp: Timestamp.now(),
        date: new Date().toDateString(),
      };

      // Önce local'de AsyncStorage'a kaydet
      const existingSessions = await AsyncStorage.getItem("sessions");
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      const localSession = {
        ...sessionData,
        timestamp: new Date().toISOString(),
        synced: false,
      };
      sessions.push(localSession);
      await AsyncStorage.setItem("sessions", JSON.stringify(sessions));
      console.log("✅ Local'de kaydedildi!");

      // Offline mod açıksa Firebase'e gönderme
      if (isOffline) {
        Alert.alert(
          "📱 Offline Mod",
          "Veriler lokal'de kaydedildi. İnternet bağlantısı kurulduğunda Firebase'e gönderilecek."
        );
        return;
      }

      // Sonra Firebase'e kaydetmeye çalış
      try {
        const docRef = await addDoc(collection(db, "sessions"), sessionData);
        console.log("✅ Firebase'e kaydedildi! ID:", docRef.id);

        // Firebase'e başarıyla kaydedildiyse, local'de synced olarak işaretle
        const updatedSessions = await AsyncStorage.getItem("sessions");
        if (updatedSessions) {
          const parsed = JSON.parse(updatedSessions);
          const lastSession = parsed[parsed.length - 1];
          lastSession.synced = true;
          await AsyncStorage.setItem("sessions", JSON.stringify(parsed));
        }

        Alert.alert(
          "Başarılı!",
          "Seans kaydedildi ve Firebase'e senkronize edildi."
        );
      } catch (firebaseError) {
        console.warn(
          "Firebase'e bağlanılamadı, lokal'de saklandı:",
          firebaseError
        );
        Alert.alert(
          "İnternet Yok",
          "Seans lokal'de kaydedildi. İnternet gelince Firebase'e gönderilecek."
        );
      }
    } catch (error) {
      console.error("❌ Kayıt hatası:", error);
      Alert.alert("Hata", "Seans kaydedilemedi: " + error);
    }
  };

  const adjustDuration = (amount: number) => {
    const newDuration = Math.max(1, duration + amount);
    setDuration(newDuration);
    setTimeLeft(newDuration * 60);
  };

  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutes);
    if (isNaN(minutes) || minutes < 1) {
      Alert.alert("Hata", "Lütfen geçerli bir dakika girin (minimum 1)");
      return;
    }
    setDuration(minutes);
    setTimeLeft(minutes * 60);
    setCustomMinutes("");
    setShowCustomInput(false);
  };
  const handleAddCategory = async () => {
    const trimmedCategory = customCategory.trim();
    if (!trimmedCategory) {
      Alert.alert("Hata", "Lütfen geçerli bir kategori adı girin");
      return;
    }
    if (categories.includes(trimmedCategory)) {
      Alert.alert("Hata", "Bu kategori zaten mevcut");
      return;
    }
    const newCategories = [...categories, trimmedCategory];
    setCategories(newCategories);
    setCategory(trimmedCategory);
    try {
      await AsyncStorage.setItem("categories", JSON.stringify(newCategories));
    } catch (error) {
      console.error("Kategori kaydedilemedi:", error);
    }
    setCustomCategory("");
    setShowCategoryInput(false);
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    Alert.alert(
      "Kategori Sil",
      `"${categoryToDelete}" kategorisini silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            const newCategories = categories.filter(
              (cat) => cat !== categoryToDelete
            );
            setCategories(newCategories);
            // Eğer silinen kategori seçiliyse, ilk kategoriye geç
            if (category === categoryToDelete && newCategories.length > 0) {
              setCategory(newCategories[0]);
            }
            try {
              await AsyncStorage.setItem(
                "categories",
                JSON.stringify(newCategories)
              );
            } catch (error) {
              console.error("Kategori silinemedi:", error);
            }
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <ScrollView
      style={[
        styles.ScrollView,
        { backgroundColor: isDark ? "#151718" : "#f5f5f5" },
      ]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.timerContainer,
            (status === "running" || status === "paused") &&
              styles.timerContainerLandscape,
          ]}
        >
          <Text
            style={[
              styles.timer,
              (status === "running" || status === "paused") &&
                styles.timerLandscape,
              { color: isDark ? "#ECEDEE" : "#333" },
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>

        {status !== "idle" && (
          <View style={styles.sessionInfoRow}>
            <Text
              style={[
                styles.sessionInfoText,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
              numberOfLines={1}
            >
              {category}
            </Text>
            <Text
              style={[
                styles.sessionInfoText,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              Dikkat: {distractionCount}
            </Text>
          </View>
        )}

        {/* Süre Ayarı */}
        {status === "idle" && (
          <View style={styles.durationContainer}>
            <View style={styles.durationButtons}>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  { backgroundColor: isDark ? "#2a2d2e" : "#3333" },
                ]}
                onPress={() => adjustDuration(-5)}
              >
                <Text style={styles.adjustButtonText}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  { backgroundColor: isDark ? "#2a2d2e" : "#3333" },
                ]}
                onPress={() => adjustDuration(-1)}
              >
                <Text style={styles.adjustButtonText}>-1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  { backgroundColor: isDark ? "#2a2d2e" : "#3333" },
                ]}
                onPress={() => adjustDuration(+1)}
              >
                <Text style={styles.adjustButtonText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  { backgroundColor: isDark ? "#2a2d2e" : "#3333" },
                ]}
                onPress={() => adjustDuration(+5)}
              >
                <Text style={styles.adjustButtonText}>+5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.adjustButton,
                  styles.customButton,
                  { backgroundColor: isDark ? "#ECEDEE" : "#333" },
                ]}
                onPress={() => setShowCustomInput(true)}
              >
                <Text
                  style={[
                    styles.adjustButtonText,
                    { color: isDark ? "#333" : "#fff" },
                  ]}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Kategori Seçimi */}
        {status === "idle" && (
          <View style={styles.categoryContainer}>
            <Text
              style={[
                styles.categoryLabel,
                { color: isDark ? "#ECEDEE" : "#555" },
              ]}
            >
              Kategori Seçin:
            </Text>
            <View style={styles.categoryButtons}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: isDark ? "#2a2d2e" : "#f0f0f0" },
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  onLongPress={() => handleDeleteCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: isDark ? "#ECEDEE" : "#333" },
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  styles.addCategoryButton,
                  { backgroundColor: isDark ? "#ECEDEE" : "#333" },
                ]}
                onPress={() => setShowCategoryInput(true)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    { color: isDark ? "#333" : "#fff" },
                  ]}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Kontrol Butonları */}
        <View
          style={[
            styles.buttonContainer,
            (status === "running" || status === "paused") &&
              styles.buttonContainerLandscape,
          ]}
        >
          {status === "idle" && (
            <TouchableOpacity style={styles.iconButton} onPress={handleStart}>
              <IconSymbol name="play.fill" size={32} color="#4CAF50" />
              <Text
                style={[
                  styles.iconLabel,
                  { color: isDark ? "#ECEDEE" : "#333" },
                ]}
              >
                Başlat
              </Text>
            </TouchableOpacity>
          )}
          {status === "running" && (
            <TouchableOpacity style={styles.iconButton} onPress={handlePause}>
              <IconSymbol name="pause.fill" size={32} color="#FFA500" />
              <Text
                style={[
                  styles.iconLabel,
                  { color: isDark ? "#ECEDEE" : "#333" },
                ]}
              >
                Duraklat
              </Text>
            </TouchableOpacity>
          )}
          {status === "paused" && (
            <>
              <TouchableOpacity style={styles.iconButton} onPress={handleStart}>
                <IconSymbol name="play.fill" size={32} color="#4CAF50" />
                <Text
                  style={[
                    styles.iconLabel,
                    { color: isDark ? "#ECEDEE" : "#333" },
                  ]}
                >
                  Devam
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleShowSummary}
              >
                <IconSymbol name="stop.fill" size={32} color="#f44336" />
                <Text
                  style={[
                    styles.iconLabel,
                    { color: isDark ? "#ECEDEE" : "#333" },
                  ]}
                >
                  Bitir
                </Text>
              </TouchableOpacity>
            </>
          )}
          {status !== "idle" && (
            <TouchableOpacity style={styles.iconButton} onPress={handleReset}>
              <IconSymbol name="arrow.clockwise" size={32} color="#757575" />
              <Text
                style={[
                  styles.iconLabel,
                  { color: isDark ? "#ECEDEE" : "#333" },
                ]}
              >
                Sıfırla
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Özel Süre Girişi Modal */}
        <Modal
          visible={showCustomInput}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCustomInput(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDark ? "#1f2122" : "#fff" },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? "#ECEDEE" : "#333" },
                ]}
              >
                Özel Süre Gir
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#2a2d2e" : "#f5f5f5",
                    color: isDark ? "#ECEDEE" : "#333",
                  },
                ]}
                placeholder="Dakika girin"
                placeholderTextColor={isDark ? "#9BA1A6" : "#999"}
                keyboardType="numeric"
                value={customMinutes}
                onChangeText={setCustomMinutes}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={() => {
                    setShowCustomInput(false);
                    setCustomMinutes("");
                  }}
                >
                  <ThemedText style={styles.buttonText}>İptal</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCustomDuration}
                >
                  <ThemedText style={styles.buttonText}>Onayla</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Özel Kategori Girişi Modal */}
        <Modal
          visible={showCategoryInput}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCategoryInput(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDark ? "#1f2122" : "#fff" },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? "#ECEDEE" : "#333" },
                ]}
              >
                Yeni Kategori Ekle
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#2a2d2e" : "#f5f5f5",
                    color: isDark ? "#ECEDEE" : "#333",
                  },
                ]}
                placeholder="Kategori adı girin"
                placeholderTextColor={isDark ? "#9BA1A6" : "#999"}
                value={customCategory}
                onChangeText={setCustomCategory}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={() => {
                    setShowCategoryInput(false);
                    setCustomCategory("");
                  }}
                >
                  <ThemedText style={styles.buttonText}>İptal</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleAddCategory}
                >
                  <ThemedText style={styles.buttonText}>Ekle</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Seans Özeti Modal */}
        <Modal
          visible={showSummary}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSummary(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDark ? "#1f2122" : "#fff" },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? "#ECEDEE" : "#333" },
                ]}
              >
                Seans Özeti
              </Text>
              <Text
                style={[
                  styles.summaryText,
                  { color: isDark ? "#9BA1A6" : "#666" },
                ]}
              >
                Kategori: {category}
              </Text>
              <Text
                style={[
                  styles.summaryText,
                  { color: isDark ? "#9BA1A6" : "#666" },
                ]}
              >
                Süre: {Math.floor(completedTime / 60)} dakika{" "}
                {completedTime % 60} saniye
              </Text>
              <Text
                style={[
                  styles.summaryText,
                  { color: isDark ? "#9BA1A6" : "#666" },
                ]}
              >
                Dikkat Dağınıklığı: {distractionCount}
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  saveSessionToFirebase();
                  setShowSummary(false);
                  // Özet kapatıldığında session'ı reset et
                  setStatus("idle");
                  setTimeLeft(duration * 60);
                  setDistractionCount(0);
                  setCompletedTime(0);
                }}
              >
                <ThemedText style={styles.buttonText}>
                  Kaydet ve Kapat
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  durationContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 0,
    width: "100%",
  },
  durationLabel: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
    color: "#555",
  },
  durationButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  adjustButton: {
    backgroundColor: "#3333",
    padding: 12,
    borderRadius: 10,
    minWidth: 55,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  customButton: {
    minWidth: 55,
  },
  adjustButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  categoryContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 0,
    width: "100%",
  },
  categoryLabel: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
    color: "#555",
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  categoryButton: {
    backgroundColor: "#3333",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#45a049",
  },
  categoryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  addCategoryButton: {
    minWidth: 50,
    paddingHorizontal: 20,
  },
  timerContainer: {
    marginVertical: 30,
    paddingVertical: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  timerContainerLandscape: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  timer: {
    fontSize: 110,
    fontWeight: "500",
    letterSpacing: 4,
  },
  timerLandscape: {
    fontSize: 170,
    letterSpacing: 6,
  },
  sessionInfoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "80%",
    marginTop: 4,
    marginBottom: 10,
  },
  sessionInfoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  distractionContainer: {
    marginBottom: 25,
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distractionButton: {
    backgroundColor: "#FFA500",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#FFA500",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonContainerLandscape: {
    marginTop: 0,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    minWidth: 110,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: "#f44336",
    shadowColor: "#f44336",
  },
  resetButton: {
    backgroundColor: "#757575",
    shadowColor: "#757575",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#3333",
    padding: 35,
    borderRadius: 20,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#fff",
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 12,
    color: "#fff",
    fontWeight: "500",
  },
  testButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
