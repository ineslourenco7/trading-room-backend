import cors from "cors"
import express from "express"
import http from "http"
import { Server } from "socket.io"
import { env } from "./config/env"

const app = express()
const server = http.createServer(app)

app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "trading-room-backend" })
})

const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
})

io.on("connection", (socket) => {
  socket.emit("connected", {
    id: socket.id,
    timestamp: new Date().toISOString(),
  })

  socket.on("message:send", (payload) => {
    io.emit("message:new", {
      ...payload,
      timestamp: new Date().toISOString(),
    })
  })
})

server.listen(env.PORT, () => {
  console.log(`Trading Room backend running on port ${env.PORT}`)
})
