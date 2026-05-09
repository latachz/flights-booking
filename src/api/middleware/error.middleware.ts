import { Request, Response, NextFunction } from 'express'

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const msg = err.message ?? 'Internal server error'

  if (msg === 'Invalid credentials' || msg === 'Invalid token' || msg === 'Token expired') {
    res.status(401).json({ error: msg })
  } else if (msg === 'Access denied') {
    res.status(403).json({ error: msg })
  } else if (msg.toLowerCase().includes('not found')) {
    res.status(404).json({ error: msg })
  } else if (msg.includes('Not enough seats') || msg.includes('cannot be cancelled')) {
    res.status(409).json({ error: msg })
  } else {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
