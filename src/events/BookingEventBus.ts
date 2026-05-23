type EventHandler<T> = (event: T) => Promise<void>

export class BookingEventBus {
  private readonly handlers = new Map<string, EventHandler<unknown>[]>()

  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) this.handlers.set(eventType, [])
    this.handlers.get(eventType)!.push(handler as EventHandler<unknown>)
  }

  async emit<T>(eventType: string, event: T): Promise<void> {
    const list = this.handlers.get(eventType) ?? []
    for (const handler of list) {
      await handler(event)
    }
  }
}
