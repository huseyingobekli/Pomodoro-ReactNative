import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

export default function Index() {
  const WORK_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;

  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const switchMode = useCallback(
    (nextMode: "work" | "break") => {
      setMode(nextMode);
      setSecondsLeft(nextMode === "work" ? WORK_DURATION : BREAK_DURATION);
      setIsRunning(false);
    },
    [WORK_DURATION, BREAK_DURATION]
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
      switchMode("break");
    } else {
      switchMode("work");
    }
  }, [secondsLeft, mode, switchMode]);

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    switchMode("work");
    setCompleted(0);
  };

  const skipPhase = () => {
    if (mode === "work") {
      switchMode("break");
    } else {
      switchMode("work");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro</Text>
      <Text style={styles.subTitle}>
        {mode === "work" ? "Çalışma" : "Kısa mola"}
      </Text>
      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formattedTime}</Text>
      </View>
      <Text style={styles.counter}>
        Tamamlanan pomodoro: {completed.toString().padStart(2, "0")}
      </Text>
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
