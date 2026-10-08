/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** EmailJS service id (public). See .env.example. */
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  /** EmailJS template id (public). The template fixes the recipient. */
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  /** EmailJS public key (public by design; not a secret). */
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
