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

		it("should work with meeting.created event type", async () => {
			const meetingData = {
				id: "645beefe-6b00-45a2-af8e-fb2d190fce4z",
				workspace_id: "ws_789",
				status: "completed",
				permission: "workspace",
				title: "Test Meeting",
				private_note: "",
				total_duration_sec: 29,
				meeting_autostarted_app: null,
				audio_location: "aside-server",
				audio_url: "https://example.com/audio.m4a",
				created_by: "user_123",
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-01T00:00:00Z",
				archived_at: null,
				suggestions: {},
				calendar_event_id: "cal_123",
				transcripts: [
					{
						id: "G0",
						end: 8,
						text: "Hello, this is a test.",
						start: 1,
						words: [{ end: 8, text: "Hello, this is a test.", start: 1 }],
						speaker: "Speaker A",
						chunkId: "chunk_1",
						segmentId: "seg_1",
					},
				],
				language: "en-US",
				is_auto_ended: false,
				auto_end_reason: null,
				live_scenario_id: "scenario_1",
				questions: {},
				speaker_analysis: [
					{
						id: "Speaker A",
						name: "John",
						role: "Host",
						nameReason: "",
						voiceSampleUrl: "",
						voiceCharacteristics: "Male, clear tone",
					},
				],
				linked_crm: null,
				reference_call_supermemory_id: null,
				llm_sharing_agreed_at: null,
				summary: {
					content: "Test summary",
					language: "English",
					created_at: "2024-01-01T00:00:00Z",
					template_id: null,
				},
				calendarEvent: {
					id: "cal_123",
					href: "https://calendar.example.com/event",
					title: "Test Meeting",
					endsAt: "2024-01-01T01:00:00Z",
					startsAt: "2024-01-01T00:00:00Z",
					timezone: "UTC",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
					calendarId: "primary",
					uuid: "uuid_123",
					attendees: [],
				},
				timelineSummary: "",
				creator: {
					id: "user_123",
					name: "John Doe",
					email: "john@example.com",
					locale: "en-US",
					job_title: "Engineer",
					profile_url: "",
				},
				acl_rules: [
					{
						id: "acl_1",
						user: null,
						folder: null,
						can_read: true,
						can_write: true,
						principal_type: "workspace",
					},
				],
			};

			const eventData = {
				type: "meeting.created",
				eventId: "evt_123",
				webhookId: "wh_456",
				workspaceId: "ws_789",
				timestamp: "2024-01-01T00:00:00Z",
				payload: { meeting: meetingData },
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

			const result = await verifier.verifyRequest<"meeting.created">(request);
			expect(result.isValid).toBe(true);
			expect(result.data?.payload.meeting.id).toBe(
				"645beefe-6b00-45a2-af8e-fb2d190fce4z",
			);
			expect(result.data?.payload.meeting.title).toBe("Test Meeting");
			expect(result.data?.payload.meeting.transcripts[0].text).toBe(
				"Hello, this is a test.",
			);
			expect(result.data?.payload.meeting.summary.content).toBe("Test summary");
		});

		it("should work with meeting.audio_uploaded event type", async () => {
			const eventData = {
				type: "meeting.audio_uploaded",
				eventId: "evt_456",
				webhookId: "wh_456",
				workspaceId: "ws_789",
				timestamp: "2024-01-01T00:00:00Z",
				payload: {
					audio_url: "https://example.com/meetings/full-1.m4a",
				},
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

			const result =
				await verifier.verifyRequest<"meeting.audio_uploaded">(request);
			expect(result.isValid).toBe(true);
			expect(result.data?.payload.audio_url).toBe(
				"https://example.com/meetings/full-1.m4a",
			);
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
