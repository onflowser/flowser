export function shortenText(text: string, maxLength: number): string {
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

export function isDefined<Value>(
  value: Value | null | undefined
): value is Value {
  return value !== null && value !== undefined;
}
