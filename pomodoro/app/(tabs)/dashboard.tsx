import { ThemedText } from "@/components/themed-text";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Text,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { db } from "@/config/firebase";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SessionData {
  id: string;
  category: string;
  durationMinutes: number;
  durationSeconds: number;
  distractionCount: number;
  timestamp: any;
  date: string;
}

export default function DashboardScreen() {
  const { activeTheme } = useTheme();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isDark = activeTheme === "dark";

  // Synced olmayan local verileri Firebase'ye gönder
  const syncLocalDataToFirebase = async () => {
    try {
      const offlineMode = await AsyncStorage.getItem("offlineMode");
      if (offlineMode === "true") {
        console.log("📱 Offline mod açık, senkronizasyon yapılmayacak");
        return;
      }

      const localSessions = await AsyncStorage.getItem("sessions");
      if (!localSessions) return;

      const sessions = JSON.parse(localSessions);
      const unsyncedSessions = sessions.filter((s: any) => !s.synced);

      if (unsyncedSessions.length === 0) {
        console.log("✅ Tüm veriler zaten senkronize edilmiş");
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
          return; // Hata varsa dur
        }
      }

      // Tüm veriler başarıyla gönderildiyse, synced: true yap
      const updatedSessions = sessions.map((s: any) => ({
        ...s,
        synced: true,
      }));
      await AsyncStorage.setItem("sessions", JSON.stringify(updatedSessions));
      console.log("✅ Senkronizasyon tamamlandı!");
    } catch (error) {
      console.error("Senkronizasyon hatası:", error);
    }
  };

  const fetchSessions = React.useCallback(async () => {
    try {
      setLoading(true);

      // Önce senkronizasyon dene
      await syncLocalDataToFirebase();

      let allData: SessionData[] = [];

      // Önce local AsyncStorage'dan oku (sadece synced olmayan verileri)
      try {
        const localSessions = await AsyncStorage.getItem("sessions");
        if (localSessions) {
          const parsed = JSON.parse(localSessions);
          // Sadece synced olmayan (Firebase'e gönderilmemiş) verileri al
          const unsyncedSessions = parsed.filter((s: any) => !s.synced);
          const mappedSessions = unsyncedSessions.map((s: any) => ({
            ...s,
            id: s.id || Math.random().toString(),
          }));
          allData = mappedSessions;
          console.log("📱 Local verileri yüklendi:", allData.length, "seans");
        }
      } catch (localError) {
        console.warn("Local veriler yüklenemedi:", localError);
      }

      // Sonra Firebase'ten oku
      try {
        const sessionsRef = collection(db, "sessions");
        const snapshot = await getDocs(sessionsRef);
        const firebaseData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SessionData[];

        // Firebase ve local verileri birleştir (tekrar kaydını önle)
        const firebaseIds = new Set(firebaseData.map((s) => s.id));
        const localOnly = allData.filter((s) => !firebaseIds.has(s.id));
        allData = [...firebaseData, ...localOnly];

        console.log(
          "☁️ Firebase verileri yüklendi:",
          firebaseData.length,
          "seans"
        );
      } catch (firebaseError) {
        console.warn(
          "Firebase'ten veri yüklenemedi (offline?):",
          firebaseError
        );
        // Firebase başarısız olsa bile, local verileri göster
      }

      setSessions(allData);
      console.log("📊 Toplam veriler:", allData.length, "seans");
    } catch (error) {
      console.error("Veriler alınamadı:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
  };

  // Sayfa her açıldığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      fetchSessions();
    }, [fetchSessions])
  );

  // Bugünün tarihi
  const today = new Date().toDateString();

  // Bugün toplam odaklanma süresi
  const todayTotal = sessions
    .filter((s) => s.date === today)
    .reduce((acc, s) => acc + s.durationMinutes * 60 + s.durationSeconds, 0);

  // Tüm zamanların toplam
  const allTimeTotal = sessions.reduce(
    (acc, s) => acc + s.durationMinutes * 60 + s.durationSeconds,
    0
  );

  // Toplam dikkat dağınıklığı
  const totalDistraction = sessions.reduce(
    (acc, s) => acc + s.distractionCount,
    0
  );

  // Son 7 günün verisi (Bar Chart)
  const getLast7Days = () => {
    const data: { [key: string]: number } = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data[
        date.toLocaleDateString("tr-TR", { month: "2-digit", day: "2-digit" })
      ] = 0;
    }

    sessions.forEach((s) => {
      const dateObj = new Date(s.date);
      const dateStr = dateObj.toLocaleDateString("tr-TR", {
        month: "2-digit",
        day: "2-digit",
      });
      if (data.hasOwnProperty(dateStr)) {
        data[dateStr] += s.durationMinutes;
      }
    });

    return {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data),
        },
      ],
    };
  };

  // Kategoriye göre dağılım (Pie Chart)
  const getCategoryDistribution = () => {
    const categoryData: { [key: string]: number } = {};
    let total = 0;

    sessions.forEach((s) => {
      const minutes = s.durationMinutes;
      categoryData[s.category] = (categoryData[s.category] || 0) + minutes;
      total += minutes;
    });

    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];
    let colorIndex = 0;

    return Object.entries(categoryData).map(([category, minutes]) => ({
      name: category,
      population: Math.round((minutes / total) * 100),
      color: colors[colorIndex++ % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const barChartData = getLast7Days();
  const pieChartData = getCategoryDistribution();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}s ${mins}d`;
  };

  if (loading && sessions.length === 0) {
    return (
      <SafeAreaView style={styles.scroll}>
        <View style={styles.container}>
          <ThemedText>Veriler yükleniyor...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      style={[
        styles.scroll,
        { backgroundColor: isDark ? "#151718" : "#f5f5f5" },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: isDark ? "#ECEDEE" : "#333" }]}>
          İstatistikler
        </Text>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statBox,
              { backgroundColor: isDark ? "#1f2122" : "#fff" },
            ]}
          >
            <IconSymbol
              name="calendar"
              size={24}
              color="#2196F3"
              style={styles.statIcon}
            />
            <Text style={{ color: isDark ? "#9BA1A6" : "#666", fontSize: 12 }}>
              Bugün
            </Text>
            <Text
              style={[styles.statValue, { color: isDark ? "#ECEDEE" : "#333" }]}
            >
              {formatTime(todayTotal)}
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: isDark ? "#1f2122" : "#fff" },
            ]}
          >
            <IconSymbol
              name="clock.fill"
              size={24}
              color="#4CAF50"
              style={styles.statIcon}
            />
            <Text style={{ color: isDark ? "#9BA1A6" : "#666", fontSize: 12 }}>
              Toplam
            </Text>
            <Text
              style={[styles.statValue, { color: isDark ? "#ECEDEE" : "#333" }]}
            >
              {formatTime(allTimeTotal)}
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: isDark ? "#1f2122" : "#fff" },
            ]}
          >
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={24}
              color="#FF9800"
              style={styles.statIcon}
            />
            <Text style={{ color: isDark ? "#9BA1A6" : "#666", fontSize: 12 }}>
              Toplam İhlal
            </Text>
            <Text
              style={[styles.statValue, { color: isDark ? "#ECEDEE" : "#333" }]}
            >
              {totalDistraction}
            </Text>
          </View>
        </View>

        {/* Bar Chart - Son 7 Gün */}
        {sessions.length > 0 && (
          <View
            style={[
              styles.chartContainer,
              { backgroundColor: isDark ? "#1f2122" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.chartTitle,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              Son 7 Günün Odaklanma Süresi
            </Text>
            <BarChart
              data={barChartData}
              width={350}
              height={220}
              yAxisLabel=""
              yAxisSuffix="d"
              chartConfig={{
                backgroundColor: isDark ? "#1f2122" : "#ffffff",
                backgroundGradientFrom: isDark ? "#1f2122" : "#ffffff",
                backgroundGradientTo: isDark ? "#1f2122" : "#ffffff",
                color: (opacity = 1) =>
                  isDark
                    ? `rgba(79, 172, 254, ${opacity})`
                    : `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) =>
                  isDark
                    ? `rgba(236, 237, 238, ${opacity})`
                    : `rgba(0, 0, 0, ${opacity})`,
                strokeWidth: 2,
                barPercentage: 0.7,
                useShadowColorFromDataset: false,
              }}
              style={styles.chart}
            />
          </View>
        )}

        {/* Pie Chart - Kategoriler */}
        {pieChartData.length > 0 && (
          <View
            style={[
              styles.chartContainer,
              { backgroundColor: isDark ? "#1f2122" : "#fff" },
            ]}
          >
            <Text
              style={[
                styles.chartTitle,
                { color: isDark ? "#ECEDEE" : "#333" },
              ]}
            >
              Kategorilere Göre Dağılım
            </Text>
            <PieChart
              data={pieChartData}
              width={350}
              height={220}
              chartConfig={{
                color: (opacity = 1) =>
                  isDark
                    ? `rgba(236, 237, 238, ${opacity})`
                    : `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}

        {sessions.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText>Henüz veri yok. Bir seans oluşturun!</ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#33333",
    top: 70,
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 25,
  },
  statBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "48%",
    maxWidth: 112,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
});
