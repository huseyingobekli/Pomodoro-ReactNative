import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

export default function Index() {
  const WORK_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;
  const LONG_BREAK_DURATION = 15 * 60;

  const durations = useMemo(
    () => ({
      work: WORK_DURATION,
      break: BREAK_DURATION,
      longBreak: LONG_BREAK_DURATION,
    }),
    [WORK_DURATION, BREAK_DURATION, LONG_BREAK_DURATION]
  );

  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break" | "longBreak">("work");
  const [completed, setCompleted] = useState(0);
  const [autoStartNext, setAutoStartNext] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const switchMode = useCallback(
    (nextMode: "work" | "break" | "longBreak", shouldRun = false) => {
      setMode(nextMode);
      setSecondsLeft(durations[nextMode]);
      setIsRunning(shouldRun);
    },
    [durations]
  );

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (secondsLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft > 0) return;

    if (mode === "work") {
      setCompleted((count) => count + 1);
      const shouldLongBreak = (completed + 1) % 4 === 0;
      switchMode(shouldLongBreak ? "longBreak" : "break", autoStartNext);
    } else {
      switchMode("work", autoStartNext);
    }
  }, [secondsLeft, mode, switchMode, completed, autoStartNext]);

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    switchMode("work");
    setCompleted(0);
  };

  const skipPhase = () => {
    if (mode === "work") {
      switchMode("break", autoStartNext);
    } else {
      switchMode("work", autoStartNext);
    }
  };

  const progress = useMemo(() => {
    const total = durations[mode];
    return total === 0 ? 0 : 1 - secondsLeft / total;
  }, [secondsLeft, mode, durations]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro</Text>
      <Text style={styles.subTitle}>
        {mode === "work"
          ? "Çalışma"
          : mode === "break"
          ? "Kısa mola"
          : "Uzun mola"}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formattedTime}</Text>
      </View>
      <Text style={styles.counter}>
        Tamamlanan pomodoro: {completed.toString().padStart(2, "0")}
      </Text>
      <Pressable
        style={[
          styles.toggle,
          { backgroundColor: autoStartNext ? "#1b5e20" : "#333" },
        ]}
        onPress={() => setAutoStartNext((prev) => !prev)}
      >
        <Text style={styles.toggleText}>
          {autoStartNext ? "Otomatik başlat: açık" : "Otomatik başlat: kapalı"}
        </Text>
      </Pressable>
      <View style={styles.divButtons}>
        <ActionButton
          label={isRunning ? "Duraklat" : "Başlat"}
          onPress={toggleTimer}
        />
        <ActionButton label="Sıfırla" onPress={resetTimer} />
        <ActionButton label="Atla" onPress={skipPhase} />
      </View>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
};

function ActionButton({ label, onPress }: ActionButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
  },
  subTitle: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 8,
  },
  progressBar: {
    flexDirection: "row",
    width: 260,
    height: 10,
    backgroundColor: "#222",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 16,
  },
  progressFill: {
    backgroundColor: "#43a047",
  },
  divButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  timerBox: {
    borderWidth: 1,
    borderColor: "#222",
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  timerText: {
    fontSize: 48,
    color: "#fff",
  },
  counter: {
    color: "#aaa",
    marginTop: 12,
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  toggleText: {
    color: "#fff",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#e53935",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 90,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
