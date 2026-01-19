import React, { useMemo, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import type { Task, TaskType } from "../store/taskStore";
import { t } from "../i18n";

const iconFor = (type: TaskType) => {
  switch (type) {
    case "care":
      return "🫶";
    case "talk":
      return "💬";
    case "memory":
      return "🖼️";
    case "date":
      return "🍰";
    case "surprise":
      return "🎁";
    default:
      return "✅";
  }
};

export default function TaskCard({
  task,
  onToggleMine,
  onTogglePartner,
  onRemove,
}: {
  task: Task;
  onToggleMine: () => void;
  onTogglePartner: () => void;
  onRemove: () => void;
}) {
  const confirmedCount = (task.myDone ? 1 : 0) + (task.partnerDone ? 1 : 0);
  const fullyConfirmed = confirmedCount === 2;

  const scale = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.03,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
    ]).start();
  };

  const typeLabel = useMemo(() => {
    const map = t.tasks.taskTypes as Record<TaskType, string>;
    return map[task.type];
  }, [task.type]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 18 }}>{iconFor(task.type)}</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", flex: 1 }}>
                {task.title}
              </Text>
            </View>

            <Text style={{ opacity: 0.7, marginTop: 4 }}>
              {typeLabel} · {t.tasks.confirmed(confirmedCount)}
              {fullyConfirmed ? " · ✅" : ""}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              bounce();
              onRemove();
            }}
            hitSlop={10}
          >
            <Text style={{ fontWeight: "700" }}>{t.tasks.remove}</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => {
              bounce();
              onToggleMine();
            }}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 12,
              borderWidth: 1,
              alignItems: "center",
              opacity: task.myDone ? 1 : 0.75,
            }}
          >
            <Text style={{ fontWeight: "700" }}>
              {task.myDone ? t.tasks.myDoneChecked : t.tasks.myDone}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              bounce();
              onTogglePartner();
            }}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 12,
              borderWidth: 1,
              alignItems: "center",
              opacity: task.partnerDone ? 1 : 0.75,
            }}
          >
            <Text style={{ fontWeight: "700" }}>
              {task.partnerDone ? t.tasks.partnerDoneChecked : t.tasks.partnerDone}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
