import type { Request } from "express"
import type { UserPlan } from "@prisma/client"

export type RequestUser = {
  id: string
  email?: string | null
  displayName: string
  plan: UserPlan
}

export type RequestWithUser = Request & {
  user?: RequestUser
}
