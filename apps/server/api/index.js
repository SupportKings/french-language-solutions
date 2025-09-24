// Import the built JavaScript from dist directory
import app from '../dist/index.js'
import { handle } from 'hono/vercel'

// Export the Hono app with Vercel adapter
export default handle(app)
