/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CLOSE_DB, CONNECT_DB } from './config/mongodb'
import { env } from './config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  const hostname = env.APP_HOST
  const port = env.APP_PORT
  // Enable req.body
  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  app.get('/', (req, res) => {
    res.end('<h1>Hello World!</h1>')
  })

  app.listen(port, hostname, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at http://${hostname}:${port}/`)
  })

  // CLEANUP trước khi tắt server
  exitHook(() => {
    CLOSE_DB()
  })
}

// IIFE:
(async () => {
  try {
    console.log('Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('Connected to MongoDB Cloud Atlas...')

    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
