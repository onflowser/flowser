import dateFormat from "dateformat";
import { isToday, isThisMonth, isThisYear } from "date-fns";
import { ManagedProcessLog } from "@flowser/shared";
import AnsiHtmlConvert from "ansi-to-html";
import Prism from "prismjs";

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

  // TODO(milestone-6): Replace with proper code editor
  static highlightCadenceSyntax(source: string): string {
    source = Prism.highlight(source, Prism.languages.javascript, "javascript");

    const cadenceKeywords = [
      "pub",
      "fun",
      "self",
      "emit",
      "execute",
      "prepare",
      "destroy",
      "priv",
    ];

    const importantCadenceKeywords = [
      "transaction",
      "resource",
      "event",
      "contract",
    ];

    cadenceKeywords.forEach((keyword: string) => {
      const regStr = `\\b(${keyword})\\b`;
      const regex = new RegExp(regStr, "g");
      source = source.replace(regex, '<span class="token inserted">$1</span>');
    });

    importantCadenceKeywords.forEach((keyword: string) => {
      const regStr = `\\b(${keyword})\\b`;
      const regex = new RegExp(regStr, "g");
      source = source.replace(regex, '<span class="token cadence">$1</span>');
    });

    return source;
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

  static formatProcessLog(log: ManagedProcessLog): string {
    const convert = new AnsiHtmlConvert();
    // The msg field in logs can contain escaped ansi codes
    // We need to unescape them so that they can be parsed by ansi-to-html lib
    const unescaped = log.data.replace(/\\x1b/g, "\x1b");
    return this.highlightLogKeywords(convert.toHtml(unescaped));
  }
}
