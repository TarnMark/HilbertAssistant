export class AppError extends Error {
  public readonly data?: Record<string, unknown>

  constructor(message: string, data?: Record<string, unknown>) {
    super(message)
    this.name = 'AppError'
    this.data = data
  }
}
