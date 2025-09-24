import type { VercelRequest, VercelResponse } from "@vercel/node";
import { app } from "../src/index";

export const config = {
	runtime: "nodejs20.x",
	maxDuration: 30,
};

// Convert Vercel's request/response to Hono's fetch-based handling
export default async function handler(req: VercelRequest, res: VercelResponse) {
	// Create a Request object from Vercel's request
	const url = `https://${req.headers.host}${req.url}`;
	const request = new Request(url, {
		method: req.method,
		headers: req.headers as HeadersInit,
		body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
	});

	// Process through Hono
	const response = await app.fetch(request);

	// Convert Hono's Response to Vercel's response
	const body = await response.text();
	res.status(response.status);

	// Set headers
	response.headers.forEach((value, key) => {
		res.setHeader(key, value);
	});

	res.send(body);
}