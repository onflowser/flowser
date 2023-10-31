type ErrorWithMessage = { message: string };

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === 'object' && error !== null && 'message' in error;
}
