// Import the built JavaScript from dist directory
import app from '../dist/index.js'

// Helper to get raw body as string
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => {
      data += chunk.toString()
    })
    req.on('end', () => {
      resolve(data)
    })
    req.on('error', reject)
  })
}

// Export handler for Vercel Node.js runtime
export default async (req, res) => {
  try {
    // Convert Node.js request to Web API Request
    const url = `https://${req.headers.host}${req.url}`
    const headers = new Headers()

    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : String(value))
      }
    }

    let body = undefined

    // For POST/PUT/PATCH requests, get the raw body
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
      // If req.body exists (Vercel might have parsed it), use it
      if (req.body) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      } else {
        // Otherwise, read the raw body
        body = await getRawBody(req)
      }
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body
    })

    // Get response from Hono app
    const response = await app.fetch(request)

    // Set status and headers
    res.status(response.status)

    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    // Send body
    const responseBody = await response.text()
    res.send(responseBody)
  } catch (error) {
    console.error('Vercel handler error:', error)
    res.status(500).json({ error: 'Internal server error', message: error.message })
  }
}
