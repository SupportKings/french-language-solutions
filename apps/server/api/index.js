// Import the built JavaScript from dist directory
import app from '../dist/index.js'
import { handle } from 'hono/vercel'

// Export Vercel handler
export default handle(app)
