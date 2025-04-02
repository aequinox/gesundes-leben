/**
 * A utility class for handling operation results with success or failure states.
 * This provides a more explicit and type-safe way to handle errors than throwing exceptions.
 */
export class Result<T> {
  private readonly _isSuccess: boolean;
  private readonly _error?: string;
  private readonly _value?: T;
  private readonly _originalError?: Error;

  private constructor(
    isSuccess: boolean,
    error?: string,
    value?: T,
    originalError?: Error
  ) {
    this._isSuccess = isSuccess;
    this._error = error;
    this._value = value;
    this._originalError = originalError;
  }

  /**
   * Creates a success result with a value
   * @param value The success value
   */
  public static success<T>(value: T): Result<T> {
    return new Result<T>(true, undefined, value);
  }

  /**
   * Creates a failure result with an error message
   * @param error The error message
   * @param originalError Optional original error object
   */
  public static failure<T>(error: string, originalError?: Error): Result<T> {
    return new Result<T>(false, error, undefined, originalError);
  }

  /**
   * Whether the operation was successful
   */
  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Whether the operation failed
   */
  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * The error message if the operation failed
   * @throws Error if the operation was successful
   */
  public get error(): string {
    if (this._isSuccess) {
      throw new Error("Cannot get error from a success result");
    }
    return this._error!;
  }

  /**
   * The original error if one was provided
   * @throws Error if the operation was successful or no original error exists
   */
  public get originalError(): Error {
    if (this._isSuccess || !this._originalError) {
      throw new Error("No original error exists");
    }
    return this._originalError;
  }

  /**
   * The success value
   * @throws Error if the operation failed
   */
  public get value(): T {
    if (!this._isSuccess) {
      throw new Error(
        `Cannot get value from a failure result. Error: ${this._error}`
      );
    }
    return this._value!;
  }

  /**
   * Maps the success value to a new value
   * @param fn The mapping function
   */
  public map<U>(fn: (value: T) => U): Result<U> {
    if (this._isSuccess) {
      return Result.success(fn(this._value!));
    }
    return Result.failure(this._error!, this._originalError);
  }

  /**
   * Chains with another result-returning operation
   * @param fn The function that returns a new Result
   */
  public flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this._isSuccess) {
      return fn(this._value!);
    }
    return Result.failure(this._error!, this._originalError);
  }
}
