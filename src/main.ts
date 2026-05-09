import { createApp } from './api/app'
import { createContainer } from './api/container'
import { prisma } from './lib/prisma'

const PORT = process.env.PORT ?? 3000

const container = createContainer()
const app = createApp(container)

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

process.on('SIGTERM', async () => {
  server.close()
  await prisma.$disconnect()
})
