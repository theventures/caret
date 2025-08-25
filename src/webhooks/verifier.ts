import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookEventMap, WebhookEventType } from "../types/webhooks.js";

export interface VerifyRequestResult<
	T extends WebhookEventType = WebhookEventType,
> {
	isValid: boolean;
	data?: WebhookEventMap[T];
	error?: string;
}

export class WebhookVerifier {
	private secret: string;

	constructor(secret?: string) {
		const resolvedSecret = secret ?? process.env.CARET_WEBHOOK_SECRET;
		if (!resolvedSecret) {
			throw new Error(
				"Webhook secret is required. Provide it as a parameter or set CARET_WEBHOOK_SECRET environment variable.",
			);
		}
		this.secret = resolvedSecret;
	}

	/**
	 * Verify a webhook signature using HMAC-SHA256
	 * @param payload - The webhook payload (request body)
	 * @param signature - The signature from X-Caret-Signature header
	 * @returns true if the signature is valid
	 */
	verify(payload: string | Buffer, signature: string): boolean {
		try {
			const hmac = createHmac("sha256", this.secret);
			const payloadString =
				typeof payload === "string" ? payload : payload.toString();
			const calculatedSignature = hmac.update(payloadString).digest("hex");

			// Use timing-safe comparison to prevent timing attacks
			return timingSafeEqual(
				Buffer.from(calculatedSignature, "hex"),
				Buffer.from(signature, "hex"),
			);
		} catch {
			// Return false for any errors (e.g., invalid hex string)
			return false;
		}
	}

	/**
	 * Verify a webhook request and parse the typed data
	 * @param request - The incoming Request object
	 * @returns Object containing isValid flag and parsed typed data if valid
	 */
	async verifyRequest<T extends WebhookEventType = WebhookEventType>(
		request: Request,
	): Promise<VerifyRequestResult<T>> {
		const signature = request.headers.get("x-caret-signature");
		if (!signature) {
			return { isValid: false, error: "Missing X-Caret-Signature header" };
		}

		try {
			const body = await request.text();
			const isValid = this.verify(body, signature);

			if (!isValid) {
				return { isValid: false, error: "Invalid signature" };
			}

			// Parse and return typed data
			const data = JSON.parse(body) as WebhookEventMap[T];
			return { isValid: true, data };
		} catch (error) {
			return {
				isValid: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
