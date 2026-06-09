import cors from "cors"
import express from "express"
import http from "http"
import { Server } from "socket.io"
import { env } from "./config/env"
import { messagesRouter } from "./routes/messages"
import { registerTradingRoomSockets } from "./sockets/tradingRoom"

const app = express()
const server = http.createServer(app)

app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "trading-room-backend" })
})

app.use("/api/messages", messagesRouter)

const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
})

registerTradingRoomSockets(io)

server.listen(env.PORT, () => {
  console.log(`Trading Room backend running on port ${env.PORT}`)
})
