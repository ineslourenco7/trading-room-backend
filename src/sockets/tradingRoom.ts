import type { Server, Socket } from "socket.io"
import { UserPlan } from "@prisma/client"
import { prisma } from "../prisma"

const ALLOWED_PLANS: UserPlan[] = [
  UserPlan.PRO,
  UserPlan.PREMIUM,
  UserPlan.ADMIN,
]

type SocketUser = {
  id: string
  email?: string | null
  displayName: string
  plan: UserPlan
}

type SendMessagePayload = {
  asset?: string
  body?: string
}

function normalizeAsset(asset?: string) {
  return String(asset || "GLOBAL").trim().toUpperCase()
}

function getSocketUser(socket: Socket): SocketUser {
  const auth = socket.handshake.auth || {}
  const plan = String(auth.plan || "FREE").toUpperCase() as UserPlan

  return {
    id: String(auth.userId || socket.id),
    email: auth.email ? String(auth.email) : null,
    displayName: String(auth.name || "Trader"),
    plan,
  }
}

async function upsertUser(user: SocketUser) {
  return prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      displayName: user.displayName,
      plan: user.plan,
    },
    create: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      plan: user.plan,
    },
  })
}

export function registerTradingRoomSockets(io: Server) {
  io.use((socket, next) => {
    const user = getSocketUser(socket)

    if (!ALLOWED_PLANS.includes(user.plan)) {
      return next(new Error("PLAN_REQUIRED"))
    }

    socket.data.user = user
    socket.data.activeAsset = "GLOBAL"
    next()
  })

  io.on("connection", async (socket) => {
    const user = socket.data.user as SocketUser
    await upsertUser(user)

    socket.join("room:global")

    socket.emit("connected", {
      ok: true,
      socketId: socket.id,
      user,
      activeAsset: socket.data.activeAsset,
      timestamp: new Date().toISOString(),
    })

    socket.broadcast.to("room:global").emit("user:joined", {
      userId: user.id,
      displayName: user.displayName,
      timestamp: new Date().toISOString(),
    })

    socket.on("asset:change", (payload: { asset?: string }) => {
      const asset = normalizeAsset(payload?.asset)
      socket.data.activeAsset = asset
      socket.emit("asset:changed", {
        ok: true,
        asset,
        timestamp: new Date().toISOString(),
      })
    })

    socket.on("message:send", async (payload: SendMessagePayload, callback?: Function) => {
      try {
        const asset = normalizeAsset(payload?.asset || socket.data.activeAsset)
        const body = String(payload?.body || "").trim()

        if (!body) {
          callback?.({ ok: false, code: "EMPTY_MESSAGE" })
          return
        }

        const message = await prisma.roomMessage.create({
          data: {
            asset,
            body,
            authorId: user.id,
          },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                plan: true,
              },
            },
          },
        })

        io.to("room:global").emit("message:new", message)
        callback?.({ ok: true, message })
      } catch (error) {
        callback?.({ ok: false, code: "MESSAGE_SEND_FAILED" })
        socket.emit("error:server", {
          code: "MESSAGE_SEND_FAILED",
          message: "Could not persist or broadcast message",
        })
      }
    })

    socket.on("disconnect", () => {
      socket.broadcast.to("room:global").emit("user:left", {
        userId: user.id,
        displayName: user.displayName,
        timestamp: new Date().toISOString(),
      })
    })
  })
}
