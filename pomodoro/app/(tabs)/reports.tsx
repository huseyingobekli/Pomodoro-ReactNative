import { StyleSheet, View, Text } from "react-native";

const MOCK_PIE = [
  { label: "Kodlama", value: 50, color: "#4caf50" },
  { label: "Ders", value: 30, color: "#56ccf2" },
  { label: "Kitap", value: 20, color: "#ffb74d" },
];

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

      <View style={styles.cardFull}>
        <Text style={styles.cardLabel}>Pasta Grafik (Kategori Dağılımı)</Text>
        <View style={styles.pieRow}>
          <View style={styles.pieChartPlaceholder}>
            <View style={styles.pieCenter}>
              <Text style={styles.pieCenterText}>%100</Text>
              <Text style={styles.pieCenterSub}>Odak</Text>
            </View>
          </View>
          <View style={styles.pieLegend}>
            {MOCK_PIE.map((item) => (
              <View key={item.label} style={styles.legendRow}>
                <View
                  style={[styles.legendSwatch, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendValue}>{item.value}%</Text>
              </View>
            ))}
            <View style={styles.pieBar}>
              {MOCK_PIE.map((item) => (
                <View
                  key={item.label}
                  style={{
                    flex: item.value,
                    backgroundColor: item.color,
                  }}
                />
              ))}
            </View>
            <Text style={styles.cardHint}>
              Grafik şu an görsel placeholder; gerçek veriler bağlandığında
              oranlar dinamik hesaplanacak.
            </Text>
          </View>
        </View>
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
  pieRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    alignItems: "center",
  },
  pieChartPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "#0f0f0f",
    borderWidth: 12,
    borderColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pieCenter: {
    width: 70,
    height: 70,
    borderRadius: 999,
    backgroundColor: "#0b0b0b",
    justifyContent: "center",
    alignItems: "center",
  },
  pieCenterText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  pieCenterSub: {
    color: "#aaa",
    fontSize: 12,
  },
  pieLegend: {
    flex: 1,
    gap: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendLabel: {
    color: "#fff",
    flex: 1,
    fontWeight: "600",
  },
  legendValue: {
    color: "#bbb",
    fontWeight: "700",
  },
  pieBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
    backgroundColor: "#0f0f0f",
  },
});
