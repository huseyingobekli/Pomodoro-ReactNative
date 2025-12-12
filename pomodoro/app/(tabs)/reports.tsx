import { StyleSheet, View, Text } from "react-native";

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>
      <Text style={styles.subtitle}>
        Genel istatistikler (görsel placeholder)
      </Text>

      <View style={styles.cardGrid}>
        <View style={styles.statCard}>
          <Text style={styles.cardLabel}>Bugün Toplam Odaklanma Süresi</Text>
          <Text style={styles.cardValue}>--:--</Text>
          <Text style={styles.cardHint}>Günlük çalışma dakikaları</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.cardLabel}>
            Tüm Zamanların Toplam Odaklanma Süresi
          </Text>
          <Text style={styles.cardValue}>--:--</Text>
          <Text style={styles.cardHint}>Kümülatif süre</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.cardLabel}>Toplam Dikkat Dağınıklığı Sayısı</Text>
          <Text style={styles.cardValue}>--</Text>
          <Text style={styles.cardHint}>Seans içinde kaydedilen</Text>
        </View>
      </View>

      <View style={styles.cardFull}>
        <Text style={styles.cardLabel}>Son Seanslar (örnek)</Text>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionDot}>•</Text>
          <Text style={styles.sessionText}>
            Bugün 25 dk çalışma + 5 dk mola
          </Text>
        </View>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionDot}>•</Text>
          <Text style={styles.sessionText}>Dün 4 pomodoro tamamlandı</Text>
        </View>
        <Text style={styles.cardHint}>
          Veri bağlantısı eklendiğinde burası gerçek verilerle dolacak.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#aaa",
    marginTop: 4,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flexBasis: "48%",
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#1f1f1f",
    borderRadius: 12,
    padding: 12,
  },
  cardFull: {
    marginTop: 12,
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#1f1f1f",
    borderRadius: 12,
    padding: 12,
  },
  cardLabel: {
    color: "#bbb",
    fontWeight: "600",
  },
  cardValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },
  cardHint: {
    color: "#888",
    marginTop: 4,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  sessionDot: {
    color: "#888",
    fontSize: 18,
  },
  sessionText: {
    color: "#ddd",
  },
});
