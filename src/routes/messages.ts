import { Router } from "express"
import { prisma } from "../prisma"
import { requireTradingRoomAccess } from "../middleware/plan"

export const messagesRouter = Router()

messagesRouter.use(requireTradingRoomAccess)

messagesRouter.get("/", async (req, res) => {
  const asset = String(req.query.asset || "GLOBAL")
  const limit = Math.min(Number(req.query.limit || 50), 200)

  const messages = await prisma.roomMessage.findMany({
    where: asset === "GLOBAL" ? undefined : { asset },
    orderBy: { createdAt: "desc" },
    take: limit,
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

  res.json({
    ok: true,
    asset,
    count: messages.length,
    items: messages,
  })
})
