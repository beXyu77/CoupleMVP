import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";

import { useTasksStore } from "../store/taskStore";
import { useDaysStore } from "../store/dayStore";
import { useNotesStore } from "../store/noteStore";
import { todayStr, daysBetween, daysFromToday } from "../utils/date";

import { t } from "../i18n";

export default function HomeScreen() {
  const tasks = useTasksStore((s) => s.tasks);

  const startDate = useDaysStore((s) => s.startDate);
  const anniversaries = useDaysStore((s) => s.anniversaries);

  const notes = useNotesStore((s) => s.notes);
  const addNote = useNotesStore((s) => s.addNote);

  const [noteText, setNoteText] = useState("");

  const today = todayStr();

  const todayTasks = useMemo(
    () => tasks.filter((task) => task.date === today),
    [tasks, today]
  );

  const confirmedCount = todayTasks.filter(
    (task) => task.myDone && task.partnerDone
  ).length;

  const togetherDays = Math.max(0, daysBetween(startDate, today) + 1);

  const nextAnniversary = useMemo(() => {
    const future = anniversaries
      .map((a) => ({ ...a, left: daysFromToday(a.date) }))
      .filter((a) => a.left >= 0)
      .sort((x, y) => x.left - y.left);
    return future[0];
  }, [anniversaries]);

  const latestNote = notes[0];
  const latestAuthorLabel = latestNote
    ? latestNote.author === "me"
      ? t.home.authorMe
      : t.home.authorPartner
    : "—";

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* Together */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>{t.home.togetherTitle}</Text>
        <Text style={{ fontSize: 18 }}>{togetherDays} 天</Text>
        <Text style={{ opacity: 0.7 }}>{t.home.togetherSince(startDate)}</Text>
      </View>

      {/* Today Tasks */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>{t.home.todayTasksTitle}</Text>
        <Text style={{ fontSize: 18 }}>
          {t.home.todayTasksProgress(confirmedCount, todayTasks.length)}
        </Text>
        <Text style={{ opacity: 0.7 }}>{t.home.todayTasksTip}</Text>
      </View>

      {/* Next Day */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>{t.home.nextDayTitle}</Text>
        {nextAnniversary ? (
          <>
            <Text style={{ fontSize: 18 }}>{nextAnniversary.title}</Text>
            <Text style={{ opacity: 0.7 }}>
              {t.home.nextDayLeft(nextAnniversary.left, nextAnniversary.date)}
            </Text>
          </>
        ) : (
          <Text style={{ opacity: 0.7 }}>{t.home.nextDayNone}</Text>
        )}
      </View>

      {/* Note */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 }}>
        <Text style={{ fontWeight: "700" }}>{t.home.noteTitle}</Text>

        <View style={{ padding: 10, borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ opacity: 0.7 }}>{latestAuthorLabel}</Text>
          <Text style={{ fontSize: 16, marginTop: 4 }}>
            {latestNote ? latestNote.content : t.home.noteEmpty}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder={t.home.notePlaceholder}
            style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 }}
          />
          <Pressable
            onPress={() => {
              const content = noteText.trim();
              if (!content) return;
              addNote(content);
              setNoteText("");
            }}
            style={{
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontWeight: "700" }}>{t.home.noteSend}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
