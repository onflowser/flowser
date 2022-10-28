import { useEffect, useState } from "react";

export type LocalStorageProps<Value> = {
  key: string;
  deserialize?: (value: string | null) => Value;
  serialize?: (value: Value) => string | null;
};

export type LocalStorageState<Value> = [
  value: Value | null,
  setValue: (value: Value) => void
];

export function useLocalStorage<Value>({
  key,
  serialize = JSON.stringify,
  // @ts-ignore
  deserialize = JSON.parse,
}: LocalStorageProps<Value>): LocalStorageState<Value> {
  const [value, setValue] = useState<Value>(getPersistedValue());

  function getPersistedValue() {
    return deserialize(window.localStorage.getItem(key));
  }

  function setPersistedValue() {
    window.localStorage.setItem(key, serialize(value) ?? "");
  }

  useEffect(() => {
    setPersistedValue();
  }, [value]);

  return [value, setValue];
}
