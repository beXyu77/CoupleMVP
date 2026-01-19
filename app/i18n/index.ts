import { zh } from "./zh";

export type Lang = "zh" | "en";

let current: Lang = "zh";

export const setLang = (lang: Lang) => {
  current = lang;
};

export const getLang = () => current;

export const t = zh;