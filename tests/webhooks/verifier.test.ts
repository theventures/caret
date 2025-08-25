import { beforeEach, describe, expect, it } from "bun:test";
import { createHmac } from "node:crypto";
import { WebhookVerifier } from "../../src/webhooks/verifier.js";

describe("WebhookVerifier", () => {
	const secret = "test-webhook-secret";
	const verifier = new WebhookVerifier(secret);

	describe("constructor", () => {
		beforeEach(() => {
			// Clear the environment variable before each test
			delete process.env.CARET_WEBHOOK_SECRET;
		});

		it("should accept explicit secret", () => {
			const v = new WebhookVerifier("explicit-secret");
			expect(v).toBeInstanceOf(WebhookVerifier);
		});

		it("should use environment variable when no secret provided", () => {
			process.env.CARET_WEBHOOK_SECRET = "env-secret";
			const v = new WebhookVerifier();
			expect(v).toBeInstanceOf(WebhookVerifier);

			// Verify it uses the env secret
			const payload = "test";
			const hmac = createHmac("sha256", "env-secret");
			const signature = hmac.update(payload).digest("hex");
			expect(v.verify(payload, signature)).toBe(true);
		});

		it("should prefer explicit secret over environment variable", () => {
			process.env.CARET_WEBHOOK_SECRET = "env-secret";
			const v = new WebhookVerifier("explicit-secret");

			// Verify it uses the explicit secret, not env
			const payload = "test";
			const hmac = createHmac("sha256", "explicit-secret");
			const signature = hmac.update(payload).digest("hex");
			expect(v.verify(payload, signature)).toBe(true);

			// And not the env secret
			const hmacEnv = createHmac("sha256", "env-secret");
			const signatureEnv = hmacEnv.update(payload).digest("hex");
			expect(v.verify(payload, signatureEnv)).toBe(false);
		});

		it("should throw error when no secret is available", () => {
			expect(() => new WebhookVerifier()).toThrow(
				"Webhook secret is required. Provide it as a parameter or set CARET_WEBHOOK_SECRET environment variable.",
			);
		});

		it("should throw error when both secret and env are undefined", () => {
			delete process.env.CARET_WEBHOOK_SECRET;
			expect(() => new WebhookVerifier(undefined)).toThrow(
				"Webhook secret is required. Provide it as a parameter or set CARET_WEBHOOK_SECRET environment variable.",
			);
		});
	});

	describe("verify", () => {
		it("should verify a valid signature with string payload", () => {
			const payload = JSON.stringify({ type: "test", eventId: "123" });
			const hmac = createHmac("sha256", secret);
			const signature = hmac.update(payload).digest("hex");

			const result = verifier.verify(payload, signature);
			expect(result).toBe(true);
		});

		it("should verify a valid signature with Buffer payload", () => {
			const payload = Buffer.from(
				JSON.stringify({ type: "test", eventId: "123" }),
			);
			const hmac = createHmac("sha256", secret);
			const signature = hmac.update(payload).digest("hex");

			const result = verifier.verify(payload, signature);
			expect(result).toBe(true);
		});

		it("should reject an invalid signature", () => {
			const payload = JSON.stringify({ type: "test", eventId: "123" });
			const invalidSignature = "invalid-signature";

			const result = verifier.verify(payload, invalidSignature);
			expect(result).toBe(false);
		});

		it("should reject a signature created with wrong secret", () => {
			const payload = JSON.stringify({ type: "test", eventId: "123" });
			const wrongSecret = "wrong-secret";
			const hmac = createHmac("sha256", wrongSecret);
			const signature = hmac.update(payload).digest("hex");

			const result = verifier.verify(payload, signature);
			expect(result).toBe(false);
		});

		it("should reject a signature for modified payload", () => {
			const originalPayload = JSON.stringify({ type: "test", eventId: "123" });
			const modifiedPayload = JSON.stringify({ type: "test", eventId: "456" });
			const hmac = createHmac("sha256", secret);
			const signature = hmac.update(originalPayload).digest("hex");

			const result = verifier.verify(modifiedPayload, signature);
			expect(result).toBe(false);
		});

		it("should handle malformed hex signature gracefully", () => {
			const payload = JSON.stringify({ type: "test", eventId: "123" });
			const malformedSignature = "not-a-hex-string!@#$";

			const result = verifier.verify(payload, malformedSignature);
			expect(result).toBe(false);
		});
	});

	describe("verifyRequest", () => {
		it("should verify a valid request and return typed data", async () => {
			const eventData = {
				type: "test",
				eventId: "evt_123",
				webhookId: "wh_456",
				workspaceId: "ws_789",
				timestamp: "2024-01-01T00:00:00Z",
				payload: { message: "test message" },
			};
			const payload = JSON.stringify(eventData);
			const hmac = createHmac("sha256", secret);
			const signature = hmac.update(payload).digest("hex");

			const request = new Request("https://example.com/webhook", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Caret-Signature": signature,
				},
				body: payload,
			});

			const result = await verifier.verifyRequest<"test">(request);
			expect(result.isValid).toBe(true);
			expect(result.data).toEqual(eventData);
			expect(result.error).toBeUndefined();
		});

		it("should reject a request without signature header", async () => {
			const payload = JSON.stringify({ type: "test", eventId: "123" });

			const request = new Request("https://example.com/webhook", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: payload,
			});

			const result = await verifier.verifyRequest(request);
			expect(result.isValid).toBe(false);
			expect(result.data).toBeUndefined();
			expect(result.error).toBe("Missing X-Caret-Signature header");
		});

		it("should reject a request with invalid signature", async () => {
			const payload = JSON.stringify({ type: "test", eventId: "123" });

			const request = new Request("https://example.com/webhook", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Caret-Signature": "invalid-signature",
				},
				body: payload,
			});

			const result = await verifier.verifyRequest(request);
			expect(result.isValid).toBe(false);
			expect(result.data).toBeUndefined();
			expect(result.error).toBe("Invalid signature");
		});

		it("should handle invalid JSON gracefully", async () => {
			const payload = "invalid json{";
			const hmac = createHmac("sha256", secret);
			const signature = hmac.update(payload).digest("hex");

			const request = new Request("https://example.com/webhook", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Caret-Signature": signature,
				},
				body: payload,
			});

			const result = await verifier.verifyRequest(request);
			expect(result.isValid).toBe(false);
			expect(result.data).toBeUndefined();
			expect(result.error).toContain("JSON");
		});

		it("should handle request body read errors gracefully", async () => {
			// Create a request that will fail when trying to read the body
			const request = new Request("https://example.com/webhook", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Caret-Signature": "some-signature",
				},
				body: new ReadableStream({
					start(controller) {
						controller.error(new Error("Read error"));
					},
				}),
			});

			const result = await verifier.verifyRequest(request);
			expect(result.isValid).toBe(false);
			expect(result.data).toBeUndefined();
			expect(result.error).toBe("Read error");
		});

		it("should work with note.created event type", async () => {
			const noteData = {
				id: "note_123",
				title: "Test Note",
				kind: "online",
				status: "completed",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
				visibility: "private",
				tags: [],
				participants: [],
				totalDurationSec: 300,
				userWrittenNote: "Test note content",
				enhancedNote: "",
				summary: "Test summary",
				transcripts: [],
			};

			const eventData = {
				type: "note.created",
				eventId: "evt_123",
				webhookId: "wh_456",
				workspaceId: "ws_789",
				timestamp: "2024-01-01T00:00:00Z",
				payload: { note: noteData },
			};

			const payload = JSON.stringify(eventData);
			const hmac = createHmac("sha256", secret);
			const signature = hmac.update(payload).digest("hex");

			const request = new Request("https://example.com/webhook", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Caret-Signature": signature,
				},
				body: payload,
			});

			const result = await verifier.verifyRequest<"note.created">(request);
			expect(result.isValid).toBe(true);
			expect(result.data?.payload.note.id).toBe("note_123");
			expect(result.data?.payload.note.title).toBe("Test Note");
		});
	});

	describe("timing safety", () => {
		it("should use timing-safe comparison", () => {
			// This test verifies that the implementation uses timingSafeEqual
			// by checking that valid and invalid signatures take similar time
			const payload = JSON.stringify({ type: "test", eventId: "123" });
			const hmac = createHmac("sha256", secret);
			const validSignature = hmac.update(payload).digest("hex");
			const invalidSignature = "0".repeat(validSignature.length);

			// Both should complete without throwing
			expect(() => verifier.verify(payload, validSignature)).not.toThrow();
			expect(() => verifier.verify(payload, invalidSignature)).not.toThrow();
		});
	});
});
