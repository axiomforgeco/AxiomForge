/**
 * Contact delivery through EmailJS's REST API (no SDK, no new dependency).
 *
 * The site is static, so a browser-safe provider sends the mail. Only EmailJS's
 * *public* identifiers live in the bundle, read from Vite env variables; no SMTP
 * password or private key ever reaches the front end. The destination is fixed in
 * the EmailJS template itself ("To Email" = RECIPIENT), and nothing the visitor
 * types is sent as a recipient, so it cannot be redirected from the page.
 */
export const RECIPIENT = 'axiomforge.dev.03@gmail.com';
export const FORM_TITLE = 'AXIOMFORGE WEBSITE CONTACT FORM';

const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';
const TIMEOUT_MS = 15000;

const config = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ?? '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? '',
};

export const mailConfigured = Boolean(config.serviceId && config.templateId && config.publicKey);

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type SendResult = { ok: true } | { ok: false; reason: 'not-configured' | 'network' | 'timeout' | 'provider' };

/** Plain text only: control characters out (newlines and tabs stay), whitespace trimmed. */
export const clean = (value: string): string =>
  value
    .replace(/[^\P{Cc}\n\t]/gu, '')
    .replace(/\r\n?/g, '\n')
    .trim();

/** Sends the message. Resolves ok only when the provider confirms it accepted it. */
export async function sendContact(msg: ContactMessage): Promise<SendResult> {
  if (!mailConfigured) return { ok: false, reason: 'not-configured' };
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        // Template variables. EmailJS escapes {{double-brace}} values, so a visitor's
        // text is never rendered as HTML in the received email.
        template_params: {
          form_title: FORM_TITLE,
          from_name: msg.name,
          reply_to: msg.email,
          subject: msg.subject,
          message: msg.message,
        },
      }),
    });
    return res.ok ? { ok: true } : { ok: false, reason: 'provider' };
  } catch (error) {
    return { ok: false, reason: (error as Error).name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    window.clearTimeout(timer);
  }
}
