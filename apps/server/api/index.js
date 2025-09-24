// Import the built JavaScript from dist directory
import app from '../dist/index.js'

// Export handler for Vercel Node.js runtime
export default async (req, res) => {
  // Convert Node.js request to Web API Request
  const url = `https://${req.headers.host}${req.url}`
  const headers = new Headers()

  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : String(value))
    }
  }

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? JSON.stringify(req.body)
    : undefined

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
}
