import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  AppState,
  Alert,
} from "react-native";

const CATEGORIES = ["Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma"] as const;

export default function HomeScreen() {
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [distractionCount, setDistractionCount] = useState(0);
  const [summary, setSummary] = useState<{
    durationSec: number;
    category: string | null;
    distractions: number;
    reason: "bitti" | "durduruldu";
  } | null>(null);
  const [shouldPromptResume, setShouldPromptResume] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef(AppState.currentState);

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

  const formatDuration = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

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
    const sub = AppState.addEventListener("change", (nextState) => {
      const wasActive = appStateRef.current === "active";
      appStateRef.current = nextState;

      const wentBackground = wasActive && nextState !== "active";
      if (wentBackground && isRunning) {
        const elapsed = durations[mode] - secondsLeft;
        setSummary({
          durationSec: elapsed,
          category: selectedCategory,
          distractions: distractionCount + 1,
          reason: "durduruldu",
        });
        setDistractionCount((v) => v + 1);
        setIsRunning(false);
        setShouldPromptResume(true);
        setLastMessage("Uygulamadan çıkıldı, sayaç duraklatıldı.");
      }

      if (nextState === "active" && shouldPromptResume && !isRunning) {
        setShouldPromptResume(false);
        setLastMessage("Geri döndün. Devam etmek ister misin?");
        Alert.alert("Devam et?", "Sayaç duraklatıldı.", [
          {
            text: "Devam Et",
            onPress: () => {
              if (selectedCategory) {
                setLastMessage("Devam ediyor.");
                setIsRunning(true);
              } else {
                setLastMessage("Kategori seç, sonra Başlat.");
              }
            },
          },
          {
            text: "Duraklat",
            style: "cancel",
          },
        ]);
      }
    });

    return () => sub.remove();
  }, [
    isRunning,
    durations,
    mode,
    secondsLeft,
    selectedCategory,
    distractionCount,
    shouldPromptResume,
  ]);

  useEffect(() => {
    if (secondsLeft > 0) return;

    if (mode === "work") {
      setCompleted((count) => count + 1);
      setSummary({
        durationSec: durations[mode],
        category: selectedCategory,
        distractions: distractionCount,
        reason: "bitti",
      });
      const shouldLongBreak = (completed + 1) % 4 === 0;
      switchMode(shouldLongBreak ? "longBreak" : "break", autoStartNext);
      setLastMessage(
        shouldLongBreak ? "Uzun mola zamanı!" : "Harika, kısa mola zamanı!"
      );
    } else {
      switchMode("work", autoStartNext);
      setLastMessage("Çalışma turu başladı, kolay gelsin!");
    }
  }, [
    secondsLeft,
    mode,
    switchMode,
    completed,
    autoStartNext,
    durations,
    selectedCategory,
    distractionCount,
  ]);

  const toggleTimer = () => {
    if (!isRunning) {
      if (!selectedCategory) {
        setLastMessage("Başlamadan önce kategori seç");
        return;
      }
      setSummary(null);
      setLastMessage("Başladı, kolay gelsin!");
      setIsRunning(true);
      return;
    }

    const elapsed = durations[mode] - secondsLeft;
    setSummary({
      durationSec: elapsed,
      category: selectedCategory,
      distractions: distractionCount,
      reason: "durduruldu",
    });
    setIsRunning(false);
  };

  const resetTimer = () => {
    switchMode("work");
    setCompleted(0);
    setDistractionCount(0);
    setSummary(null);
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
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
            disabled={isRunning}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat && styles.chipTextActive,
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>
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
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Dikkat Dağınıklığı</Text>
          <Text style={styles.sectionValue}>{distractionCount} kez</Text>
        </View>
        <View style={styles.row}>
          <MiniButton
            label="-1"
            onPress={() => setDistractionCount((v) => Math.max(0, v - 1))}
          />
          <MiniButton
            label="+1"
            onPress={() => setDistractionCount((v) => v + 1)}
          />
        </View>
      </View>

      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Seans özeti (
            {summary.reason === "bitti" ? "Tamamlandı" : "Durduruldu"})
          </Text>
          <Text style={styles.summaryRow}>
            Süre:{" "}
            <Text style={styles.summaryValue}>
              {formatDuration(summary.durationSec)}
            </Text>
          </Text>
          <Text style={styles.summaryRow}>
            Kategori:{" "}
            <Text style={styles.summaryValue}>
              {summary.category ?? "Seçilmedi"}
            </Text>
          </Text>
          <Text style={styles.summaryRow}>
            Dikkat Dağınıklığı:{" "}
            <Text style={styles.summaryValue}>{summary.distractions}</Text>
          </Text>
        </View>
      )}
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
    backgroundColor: "#0b1220", // deep navy
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    color: "#e6f1ff",
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subTitle: {
    color: "#8aa0c8",
    fontSize: 16,
    marginTop: 8,
  },
  progressBar: {
    flexDirection: "row",
    width: 300,
    height: 10,
    backgroundColor: "#0e1a2f",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 16,
  },
  progressFill: {
    backgroundColor: "#4caf50",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    justifyContent: "center",
  },
  chip: {
    borderWidth: 1,
    borderColor: "#2a3b5f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#0e1a2f",
  },
  chipActive: {
    borderColor: "#4caf50",
    backgroundColor: "#134a2c",
  },
  chipText: {
    color: "#b7c6e6",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#e6f1ff",
  },
  divButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  timerBox: {
    borderWidth: 1,
    borderColor: "#20314f",
    backgroundColor: "#0e1a2f",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 22,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  timerText: {
    fontSize: 54,
    color: "#e6f1ff",
    letterSpacing: 1,
    fontWeight: "700",
  },
  counter: {
    color: "#8aa0c8",
    marginTop: 12,
  },
  message: {
    color: "#cfe0ff",
    marginTop: 6,
  },
  section: {
    width: 320,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#223456",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#0e1a2f",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
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
    color: "#e6f1ff",
    fontWeight: "600",
  },
  sectionValue: {
    color: "#b7c6e6",
  },
  progressFillGoal: {
    backgroundColor: "#56ccf2",
  },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  toggleText: {
    color: "#e6f1ff",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#ff5252",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  miniButton: {
    backgroundColor: "#1f2c48",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  miniButtonText: {
    color: "#e6f1ff",
    fontWeight: "600",
  },
  summaryCard: {
    width: 320,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#223456",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#0e1a2f",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  summaryTitle: {
    color: "#e6f1ff",
    fontWeight: "700",
    marginBottom: 6,
  },
  summaryRow: {
    color: "#b7c6e6",
    marginTop: 4,
  },
  summaryValue: {
    color: "#e6f1ff",
    fontWeight: "700",
  },
});
