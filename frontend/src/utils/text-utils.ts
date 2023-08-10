import dateFormat from "dateformat";
import { isToday, isThisMonth, isThisYear } from "date-fns";
import { ManagedProcessOutput } from "@flowser/shared";
import AnsiHtmlConvert from "ansi-to-html";

export class TextUtils {
  static readableNumber(value: number): string {
    const formatter = Intl.NumberFormat("en", {
      notation: "compact",
      compactDisplay: "short",
    });
    return formatter.format(value);
  }

  static shortDate(value: string): string {
    const date = new Date(value);
    if (isToday(date)) {
      return dateFormat(value, "hh:MM:ss");
    }
    if (isThisMonth(date)) {
      return dateFormat(value, "dS hh:MM");
    }
    if (isThisYear(date)) {
      return dateFormat(value, "dS mmm");
    }
    return dateFormat(value, "dS mmm yyyy");
  }

  static longDate(value: string): string {
    return dateFormat(value, "dS mmm yyyy, hh:MM:ss");
  }

  static formatProcessOutput(log: ManagedProcessOutput): string {
    const convert = new AnsiHtmlConvert();
    // The msg field in logs can contain escaped ansi codes
    // We need to unescape them so that they can be parsed by ansi-to-html lib
    const unescaped = log.data.replace(/\\x1b/g, "\x1b");
    return convert.toHtml(unescaped);
  }
}
