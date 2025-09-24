// Import the built JavaScript from dist directory
import app from '../dist/index.js'

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
  
      // For POST/PUT/PATCH requests, always read the raw body
      // Don't use req.body as it throws "Invalid JSON" error in Vercel
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
        body = await getRawBody(req)

        // Debug logging
        console.log('🔍 Request URL:', url)
        console.log('🔍 Request Method:', req.method)
        console.log('🔍 Content-Type:', req.headers['content-type'])
        console.log('🔍 Body length:', body?.length)

        // Log first 500 chars of body to see what's being sent
        if (body) {
          console.log('🔍 Body preview (first 500 chars):', body.substring(0, 500))

          // Check if it's valid JSON
          try {
            const parsed = JSON.parse(body)
            console.log('✅ Valid JSON parsed:', parsed)
          } catch (e) {
            console.error('❌ Invalid JSON at handler level:', e.message)
            console.error('❌ Full body:', body)
            // Show the problematic area around position 152
            if (body.length >= 152) {
              console.error('❌ Around position 152:', body.substring(140, 165))
            }
          }
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