import dateFormat from "dateformat";

export class TextUtils {
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
