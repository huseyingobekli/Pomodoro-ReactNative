import { StyleSheet, View, Text } from "react-native";

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>
      <Text style={styles.subtitle}>Performans özeti</Text>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bugün</Text>
          <Text style={styles.cardValue}>--</Text>
          <Text style={styles.cardHint}>Tamamlanan pomodoro</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Hafta</Text>
          <Text style={styles.cardValue}>--</Text>
          <Text style={styles.cardHint}>Toplam süre (dk)</Text>
        </View>
      </View>
      <View style={styles.cardFull}>
        <Text style={styles.cardLabel}>Not</Text>
        <Text style={styles.cardHint}>
          İstatistikler yakında eklenecek. Şimdilik Zamanlayıcı sekmesinden
          pomodoro seanslarını başlatabilirsin.
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
  cardRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  card: {
    flex: 1,
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
});
