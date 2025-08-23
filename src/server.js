import express from 'express'

const app = express()
const hostName = 'localhost'
const port = 8017

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(port, hostName, () => {
  console.log(`Server on running http://${hostName}:${port}`)
})
