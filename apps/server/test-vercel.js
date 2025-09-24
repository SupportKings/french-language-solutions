// Test script to verify the Vercel API handler works
const handler = require("./api/index.js");

// Mock Vercel request
const mockReq = {
	method: "GET",
	url: "/health",
	headers: {
		host: "localhost:3000",
	},
	body: null,
};

// Mock Vercel response
const mockRes = {
	_status: 200,
	_headers: {},
	_body: null,
	status(code) {
		this._status = code;
		return this;
	},
	setHeader(key, value) {
		this._headers[key] = value;
		return this;
	},
	send(body) {
		this._body = body;
		console.log("Response:", {
			status: this._status,
			headers: this._headers,
			body: body,
		});
	},
	json(data) {
		this.setHeader("Content-Type", "application/json");
		this.send(JSON.stringify(data));
	},
};

// Test the handler
handler(mockReq, mockRes)
	.then(() => console.log("✅ Handler test completed"))
	.catch((err) => console.error("❌ Handler test failed:", err));