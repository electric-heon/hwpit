export {};

declare global {
  interface Window {
    electronAPI: {
      getFilePath(file: File): string;
      runPythonTask: (filePath: string) => void;
      onProgress: (callback: (data: any) => void) => void;
      removeProgrssListener: () => void;
    };
  }
}