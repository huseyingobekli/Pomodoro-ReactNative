import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

export default function Index() {
  const DEFAULT_WORK = 25 * 60;
  const DEFAULT_BREAK = 5 * 60;
  const DEFAULT_LONG_BREAK = 15 * 60;

  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK);
  const [longBreakDuration, setLongBreakDuration] =
    useState(DEFAULT_LONG_BREAK);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_WORK);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break" | "longBreak">("work");
  const [completed, setCompleted] = useState(0);
  const [autoStartNext, setAutoStartNext] = useState(true);
  const [sessionGoal, setSessionGoal] = useState(8);
  const [lastMessage, setLastMessage] = useState("Odaklanmaya hazır mısın?");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durations = useMemo(
    () => ({
      work: workDuration,
      break: breakDuration,
      longBreak: longBreakDuration,
    }),
    [workDuration, breakDuration, longBreakDuration]
  );

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
      setLastMessage(
        shouldLongBreak ? "Uzun mola zamanı!" : "Harika, kısa mola zamanı!"
      );
    } else {
      switchMode("work", autoStartNext);
      setLastMessage("Çalışma turu başladı, kolay gelsin!");
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

  const goalProgress = useMemo(() => {
    if (sessionGoal <= 0) return 0;
    return Math.min(completed / sessionGoal, 1);
  }, [completed, sessionGoal]);

  const adjustDuration = (
    target: "work" | "break" | "longBreak",
    deltaSeconds: number
  ) => {
    const updater = {
      work: setWorkDuration,
      break: setBreakDuration,
      longBreak: setLongBreakDuration,
    }[target];

    updater((current) => {
      const next = Math.max(60, current + deltaSeconds);
      if (mode === target) {
        setSecondsLeft(next);
        setIsRunning(false);
      }
      return next;
    });
  };

  const adjustGoal = (delta: number) => {
    setSessionGoal((prev) => Math.max(1, prev + delta));
  };

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
      <Text style={styles.message}>{lastMessage}</Text>
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Hedef</Text>
          <Text style={styles.sectionValue}>
            {completed}/{sessionGoal}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFillGoal, { flex: goalProgress }]} />
          <View style={{ flex: 1 - goalProgress }} />
        </View>
        <View style={styles.row}>
          <MiniButton label="-1" onPress={() => adjustGoal(-1)} />
          <MiniButton label="+1" onPress={() => adjustGoal(1)} />
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Süreler (dk)</Text>
          <Text style={styles.sectionValue}>
            Çalışma {Math.round(workDuration / 60)} / Kısa{" "}
            {Math.round(breakDuration / 60)} / Uzun{" "}
            {Math.round(longBreakDuration / 60)}
          </Text>
        </View>
        <View style={styles.row}>
          <MiniButton
            label="Çalışma -1"
            onPress={() => adjustDuration("work", -60)}
          />
          <MiniButton
            label="Çalışma +1"
            onPress={() => adjustDuration("work", 60)}
          />
        </View>
        <View style={styles.row}>
          <MiniButton
            label="Kısa -1"
            onPress={() => adjustDuration("break", -60)}
          />
          <MiniButton
            label="Kısa +1"
            onPress={() => adjustDuration("break", 60)}
          />
        </View>
        <View style={styles.row}>
          <MiniButton
            label="Uzun -1"
            onPress={() => adjustDuration("longBreak", -60)}
          />
          <MiniButton
            label="Uzun +1"
            onPress={() => adjustDuration("longBreak", 60)}
          />
        </View>
      </View>
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

type MiniButtonProps = {
  label: string;
  onPress: () => void;
};

function MiniButton({ label, onPress }: MiniButtonProps) {
  return (
    <Pressable style={styles.miniButton} onPress={onPress}>
      <Text style={styles.miniButtonText}>{label}</Text>
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
  message: {
    color: "#f5f5f5",
    marginTop: 6,
  },
  section: {
    width: 300,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#0f0f0f",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionValue: {
    color: "#bbb",
  },
  progressFillGoal: {
    backgroundColor: "#29b6f6",
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
  miniButton: {
    backgroundColor: "#424242",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  miniButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
