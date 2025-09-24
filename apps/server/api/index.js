import app from '../apps/server/src/index'
import { handle } from 'hono/vercel'

// Export Vercel handler
export default handle(app)
