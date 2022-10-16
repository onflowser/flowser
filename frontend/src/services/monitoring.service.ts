export type CaptureErrorOptions = {
  extra?: Record<string, unknown>;
};

export interface MonitoringServiceInt {
  captureError(error: unknown, options?: CaptureErrorOptions): void;
}
