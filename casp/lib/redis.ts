import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/^"(.*)"$/, "$1")
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.replace(/^"(.*)"$/, "$1")

export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null
