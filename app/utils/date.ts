export const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const daysBetween = (fromYYYYMMDD: string, toYYYYMMDD: string) => {
  const a = new Date(fromYYYYMMDD + "T00:00:00");
  const b = new Date(toYYYYMMDD + "T00:00:00");
  const diff = b.getTime() - a.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const daysFromToday = (targetYYYYMMDD: string) => {
  return daysBetween(todayStr(), targetYYYYMMDD);
};

export const isValidYYYYMMDD = (s: string) => {
  // 简单校验：YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00");
  return !Number.isNaN(d.getTime());
};

export const toYYYYMMDD = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export type Anniversary = {
  id: string;
  title: string;
  time: string; // HH:mm
};

export const toHHmm = (d: Date) => {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};
