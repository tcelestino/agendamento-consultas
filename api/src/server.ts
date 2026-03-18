import { app } from './app'
import connectDb from './infra/db/database'
import { logger } from './infra/logs'

const port = process.env.PORT || 3000

await connectDb()

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})
