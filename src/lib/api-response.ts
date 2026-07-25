/**
 * Standard API / server-action response envelope.
 * All mutating actions should return this shape so the UI can toast consistently.
 */
export type ApiSuccess<T = void> = {
  success: true;
  message: string;
  data: T extends void ? null : T;
  error: null;
};

export type ApiFailure = {
  success: false;
  message: string;
  data: null;
  error: string;
};

export type ApiResponse<T = void> = ApiSuccess<T> | ApiFailure;

export function ok(message: string): ApiSuccess<void>;
export function ok<T>(message: string, data: T): ApiSuccess<T>;
export function ok<T>(message: string, data?: T): ApiSuccess<T> | ApiSuccess<void> {
  if (arguments.length < 2) {
    return {
      success: true,
      message,
      data: null,
      error: null,
    };
  }
  return {
    success: true,
    message,
    data: data as T extends void ? null : T,
    error: null,
  };
}

export function fail(message: string, error?: string): ApiFailure {
  return {
    success: false,
    message,
    data: null,
    error: error ?? message,
  };
}
