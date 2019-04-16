import * as en from "./en";
import * as zhCn from "./zh-CN";

export const TRANSLATIONS = [en, zhCn];

for (const trans of TRANSLATIONS) {
  TRANSLATIONS[trans.code] = trans;
}
