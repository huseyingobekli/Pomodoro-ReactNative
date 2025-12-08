import { Button } from "@react-navigation/elements";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pomodoro</Text>
      <View style={styles.Sayac}>12:00</View>
      <View style={styles.divButtons}>
        <Button>Baslat</Button>
        <Button>Durdur</Button>
        <Button>Resetle</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 32,
  },
  divButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  Sayac: {
    fontSize: 48,
    color: "#fff",
    marginTop: 20,
  },
});
