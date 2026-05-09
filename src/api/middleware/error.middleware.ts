import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../lib/errors'
import { Logger } from '../../lib/logger'

const logger = new Logger('ErrorMiddleware')

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, err)
    }
    res.status(err.statusCode).json({ error: err.message })
  } else {
    logger.error('Unhandled error', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
