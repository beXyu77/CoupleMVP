import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { useDaysStore } from "../store/dayStore";
import { toYYYYMMDD, todayStr, daysBetween } from "../utils/date";
import { t } from "../i18n";

export default function DaysScreen() {
  const startDate = useDaysStore((s) => s.startDate);
  const anniversaries = useDaysStore((s) => s.anniversaries);
  const addAnniversary = useDaysStore((s) => s.addAnniversary);
  const removeAnniversary = useDaysStore((s) => s.removeAnniversary);

  const [title, setTitle] = useState("");
  const [pickedDate, setPickedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const dateText = toYYYYMMDD(pickedDate);

  const today = todayStr();
  const togetherDays = Math.max(0, daysBetween(startDate, today) + 1);

  const sorted = useMemo(() => {
    return [...anniversaries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [anniversaries]);

  const onPick = (event: DateTimePickerEvent, date?: Date) => {
    // Android：选择/取消都会触发
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "set" && date) {
      setPickedDate(date);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 12,
        paddingBottom: 32,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* <Text style={{ fontSize: 22, fontWeight: "700" }}>
        {t.days.title}
      </Text> */}

      {/* Together */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 }}>
        <Text style={{ fontWeight: "700" }}>
          {t.days.togetherTitle}
        </Text>
        <Text style={{ fontSize: 18 }}>
          {t.days.togetherDays(togetherDays)}
        </Text>
        <Text style={{ opacity: 0.7 }}>
          {t.days.startDateLabel(startDate)}
        </Text>
      </View>

      {/* Add */}
      <View style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 }}>
        <Text style={{ fontWeight: "700" }}>
          {t.days.addTitle}
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t.days.namePlaceholder}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
          }}
        />

        {/* Date selector */}
        <Pressable
          onPress={() => setShowPicker(true)}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ fontWeight: "700" }}>{dateText}</Text>
          <Text style={{ opacity: 0.6, marginTop: 4 }}>
            点击选择日期
          </Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={pickedDate}
            mode="date"
            display={Platform.OS === "android" ? "default" : "inline"}
            onChange={onPick}
          />
        )}

        {/* iOS inline 需要关闭按钮 */}
        {showPicker && Platform.OS !== "android" && (
          <Pressable
            onPress={() => setShowPicker(false)}
            style={{
              padding: 10,
              borderRadius: 12,
              borderWidth: 1,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "700" }}>完成</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            const safeTitle = title.trim();
            if (!safeTitle) return;

            addAnniversary(safeTitle, dateText);
            setTitle("");
          }}
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            {t.days.addButton}
          </Text>
        </Pressable>
      </View>

      {/* List */}
      <Text style={{ fontWeight: "700" }}>
        {t.days.listTitle}
      </Text>

      {sorted.length === 0 ? (
        <View style={{ borderWidth: 1, borderRadius: 14, padding: 12 }}>
          <Text style={{ fontWeight: "700" }}>
            {t.days.empty}
          </Text>
        </View>
      ) : (
        sorted.map((item) => (
          <View
            key={item.id}
            style={{ borderWidth: 1, borderRadius: 14, padding: 12, gap: 6 }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              {item.title}
            </Text>
            <Text style={{ opacity: 0.7 }}>{item.date}</Text>

            <Pressable
              onPress={() => removeAnniversary(item.id)}
              style={{
                marginTop: 6,
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                {t.days.remove}
              </Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}
