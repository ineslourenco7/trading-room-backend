import { NextFunction, Response } from "express"
import { UserPlan } from "@prisma/client"
import { RequestWithUser } from "../types"

const ALLOWED_PLANS: UserPlan[] = [
  UserPlan.PRO,
  UserPlan.PREMIUM,
  UserPlan.ADMIN,
]

export function requireTradingRoomAccess(
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) {
  const plan = (req.header("x-user-plan") || "FREE").toUpperCase() as UserPlan

  if (!ALLOWED_PLANS.includes(plan)) {
    return res.status(403).json({
      ok: false,
      code: "PLAN_REQUIRED",
      message: "Trading Room requires PRO or higher plan",
    })
  }

  req.user = {
    id: req.header("x-user-id") || "anonymous",
    displayName: req.header("x-user-name") || "Trader",
    email: req.header("x-user-email") || null,
    plan,
  }

  next()
}
