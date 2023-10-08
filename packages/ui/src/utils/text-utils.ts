import dateFormat from "dateformat";

export class TextUtils {
  static shorten(text: string, maxLength: number): string {
    if (maxLength >= text.length) {
      return text;
    }
    const delimiter = "...";
    const charsToTake = maxLength / 2;
    return `${text.slice(0, charsToTake)}${delimiter}${text.slice(
      text.length - charsToTake,
      text.length
    )}`;
  }

  static readableNumber(value: number): string {
    const formatter = Intl.NumberFormat("en", {
      notation: "compact",
      compactDisplay: "short",
    });
    return formatter.format(value);
  }

  static longDate(value: string): string {
    return dateFormat(value, "dS mmm yyyy, hh:MM:ss");
  }
}
