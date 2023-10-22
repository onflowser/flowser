import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
} from "react";

export type FilePicker = {
  pickDirectory?: () => Promise<string | undefined>;
};

const FilePickerAdapterContext = createContext<FilePicker>(
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
    <FilePickerAdapterContext.Provider value={values}>
      {children}
    </FilePickerAdapterContext.Provider>
  );
}

export function useFilePicker(): FilePicker {
  const context = useContext(FilePickerAdapterContext);
  if (!context) {
    throw new Error("Platform adapter context not found");
  }
  return context;
}
