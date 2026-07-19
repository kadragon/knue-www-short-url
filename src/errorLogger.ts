/**
 * Central structured error logger.
 *
 * Normalizes an unknown error value into a JSON payload ({ message, stack, ...meta })
 * and writes it to console.error under a `[context]` label. Local-only: no external
 * SDK or network transport, consistent with the no-server design.
 *
 * @param context - Short label identifying where the error originated (e.g. "QRCode").
 * @param error - The thrown value; may be an Error instance or any other value.
 * @param meta - Optional extra fields merged into the logged JSON payload.
 */
export function logError(context: string, error: unknown, meta?: Record<string, unknown>): void {
  // Read message/stack structurally so non-Error rejection reasons (e.g. plain
  // { message, stack } objects from cross-context/promise rejections) keep their
  // detail instead of collapsing to "[object Object]".
  const record =
    typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : undefined;
  const message = typeof record?.message === 'string' ? record.message : String(error);
  const stack = typeof record?.stack === 'string' ? record.stack : undefined;
  console.error(
    `[${context}]`,
    JSON.stringify({
      message,
      stack,
      ...meta,
    })
  );
}
