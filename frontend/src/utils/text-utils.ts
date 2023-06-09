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

  static highlightLogKeywords(logLine: string): string {
    const syntax = {
      blue: [
        "level",
        "time",
        "txID",
        "blockID",
        "blockHeight",
        "address",
        "msg",
      ],
      red: ["error"],
      yellow: [],
      green: ["event"],
      lightGrey: [],
      darkGrey: [],
    };

    Object.keys(syntax).forEach((color: string) => {
      (syntax as any)[color].forEach((keyword: string) => {
        if (logLine && logLine.replace) {
          const regStr = `\\b(${keyword})\\b`;
          const regex = new RegExp(regStr, "g");
          logLine = logLine.replace(
            regex,
            '<span class="' + color + '">$1</span>'
          );
        }
      });
    });
    return logLine;
  }

  static formatProcessOutput(log: ManagedProcessOutput): string {
    const convert = new AnsiHtmlConvert();
    // The msg field in logs can contain escaped ansi codes
    // We need to unescape them so that they can be parsed by ansi-to-html lib
    const unescaped = log.data.replace(/\\x1b/g, "\x1b");
    return this.highlightLogKeywords(convert.toHtml(unescaped));
  }
}
