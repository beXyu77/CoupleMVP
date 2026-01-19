import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, Pressable } from "react-native";

import TaskCard from "../components/TaskCard";
import { useTasksStore } from "../store/taskStore";
import type { TaskType } from "../store/taskStore";
import { todayStr } from "../utils/date";
import { t } from "../i18n";

const TYPES: TaskType[] = ["care", "talk", "memory", "date", "surprise"];

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

export default function TasksScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const addTask = useTasksStore((s) => s.addTask);
  const toggleMyDone = useTasksStore((s) => s.toggleMyDone);
  const togglePartnerDone = useTasksStore((s) => s.togglePartnerDone);
  const removeTask = useTasksStore((s) => s.removeTask);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("care");

  const today = todayStr();

  const todayTasks = useMemo(() => tasks.filter((x) => x.date === today), [tasks, today]);
  const doneCount = todayTasks.filter((x) => x.myDone && x.partnerDone).length;

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {/* <Text style={{ fontSize: 22, fontWeight: "700" }}>{t.tasks.title}</Text>
      <Text style={{ opacity: 0.7 }}>{t.tasks.todayProgress(doneCount, todayTasks.length)}</Text> */}

      {/* Type Picker */}
      <View style={{ gap: 8 }}>
        <Text style={{ opacity: 0.7 }}>{t.tasks.typePickHint}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {TYPES.map((k) => {
            const label = (t.tasks.taskTypes as Record<TaskType, string>)[k];
            const active = k === type;
            return (
              <Pressable
                key={k}
                onPress={() => setType(k)}
                style={{
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  opacity: active ? 1 : 0.65,
                }}
              >
                <Text style={{ fontWeight: "700" }}>
                  {iconFor(k)} {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Add row */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t.tasks.addPlaceholder}
          style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 }}
        />

        <Pressable
          onPress={() => {
            const text = title.trim();
            if (!text) return;
            addTask(text, today, type);
            setTitle("");
          }}
          style={{
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>{t.tasks.addButton}</Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={todayTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleMine={() => toggleMyDone(item.id)}
            onTogglePartner={() => togglePartnerDone(item.id)}
            onRemove={() => removeTask(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 16, borderWidth: 1, borderRadius: 12 }}>
            <Text style={{ fontWeight: "700" }}>{t.tasks.emptyTitle}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>{t.tasks.emptyTip}</Text>
          </View>
        }
      />
    </View>
  );
}
