import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
} from "react";

export type FilePicker = {
  pickDirectory?: () => Promise<string | undefined>;
};

const PlatformAdapterContext = createContext<FilePicker>(
  undefined as never
);

export type FilePickerProviderProps = FilePicker & {
  children: ReactNode;
};

export function FilePickerProvider({
  children,
  ...values
}: FilePickerProviderProps): ReactElement {
  return (
    <PlatformAdapterContext.Provider value={values}>
      {children}
    </PlatformAdapterContext.Provider>
  );
}

export function useFilePicker(): FilePicker {
  const context = useContext(PlatformAdapterContext);
  if (!context) {
    throw new Error("Platform adapter context not found");
  }
  return context;
}
