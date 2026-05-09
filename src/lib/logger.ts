type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export class Logger {
  constructor(private readonly context: string) {}

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data)
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data)
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`
    const output = `${prefix} ${message}`

    if (level === 'error' || level === 'warn') {
      console.error(output, ...(data !== undefined ? [data] : []))
    } else {
      console.log(output, ...(data !== undefined ? [data] : []))
    }
  }
}
