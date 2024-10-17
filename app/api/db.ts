import { Pool } from 'pg'
import { setTimeout } from 'timers/promises'

const MAX_RETRIES = 5
const INITIAL_BACKOFF = 1000 // 1 second

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

async function executeWithRetry(operation: () => Promise<unknown>, retries = MAX_RETRIES, backoff = INITIAL_BACKOFF): Promise<any> {
    try {
        return await operation()
    } catch (error) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            console.log(`Connection reset. Retrying in ${backoff}ms... (${retries} attempts left)`)
            await setTimeout(backoff)
            return executeWithRetry(operation, retries - 1, backoff * 2)
        }
        throw error
    }
}

async function queryWithRetry(query: string, params: unknown[] = []): Promise<unknown> {
    return executeWithRetry(() => pool.query(query, params))
}

export { queryWithRetry }

