/**
 * ALYN SHIR - EmailJS Integration Service for OTP & Security Dispatches
 */
import emailjs from "@emailjs/browser";

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface SendOtpResult {
  success: boolean;
  message: string;
  error?: string;
  provider: "emailjs" | "simulated";
}

export const DEFAULT_EMAILJS_CONFIG: EmailJsConfig = {
  serviceId: "service_fvtrijl",
  templateId: "template_k2rr6sa",
  publicKey: "lFvRN2wduy5HDdxII",
};

const STORAGE_KEYS = {
  SERVICE_ID: "ht_emailjs_service_id",
  TEMPLATE_ID: "ht_emailjs_template_id",
  PUBLIC_KEY: "ht_emailjs_public_key",
};

export const EmailService = {
  /**
   * Retrieves active EmailJS credentials from localStorage or Vite environment variables,
   * defaulting to the user's verified Service ID (service_fvtrijl), Template ID (template_k2rr6sa),
   * and Public Key (lFvRN2wduy5HDdxII).
   */
  getConfig(): EmailJsConfig {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

    let storedService =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.SERVICE_ID) : null;
    let storedTemplate =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.TEMPLATE_ID) : null;
    let storedPublic =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY) : null;

    // Migrate previous visual-typo keys (IFvRN2wduy5HDdxll / lFvRN2wduy5HDdxll) to verified lFvRN2wduy5HDdxII
    if (
      storedPublic === "IFvRN2wduy5HDdxll" ||
      storedPublic === "lFvRN2wduy5HDdxll" ||
      storedPublic === "IFvRN2wduy5HDdxII"
    ) {
      storedPublic = DEFAULT_EMAILJS_CONFIG.publicKey;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, DEFAULT_EMAILJS_CONFIG.publicKey);
      }
    }

    const serviceId =
      (storedService && storedService.trim() ? storedService.trim() : "") ||
      env.VITE_EMAILJS_SERVICE_ID ||
      DEFAULT_EMAILJS_CONFIG.serviceId;

    const templateId =
      (storedTemplate && storedTemplate.trim() ? storedTemplate.trim() : "") ||
      env.VITE_EMAILJS_TEMPLATE_ID ||
      DEFAULT_EMAILJS_CONFIG.templateId;

    const publicKey =
      (storedPublic && storedPublic.trim() ? storedPublic.trim() : "") ||
      env.VITE_EMAILJS_PUBLIC_KEY ||
      DEFAULT_EMAILJS_CONFIG.publicKey;

    return {
      serviceId: serviceId.trim(),
      templateId: templateId.trim(),
      publicKey: publicKey.trim(),
    };
  },

  /**
   * Check if EmailJS has been configured with all 3 required parameters.
   */
  isConfigured(): boolean {
    const { serviceId, templateId, publicKey } = this.getConfig();
    return Boolean(serviceId && templateId && publicKey);
  },

  /**
   * Check if service and template IDs are present (even before public key is pasted)
   */
  hasServiceAndTemplate(): boolean {
    const { serviceId, templateId } = this.getConfig();
    return Boolean(serviceId && templateId);
  },

  /**
   * Save user-entered EmailJS keys into local storage for immediate browser execution.
   */
  saveConfig(config: EmailJsConfig): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SERVICE_ID, config.serviceId.trim());
      localStorage.setItem(STORAGE_KEYS.TEMPLATE_ID, config.templateId.trim());
      localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, config.publicKey.trim());
      window.dispatchEvent(new Event("ht_storage_updated"));
    }
  },

  /**
   * Remove custom EmailJS credentials.
   */
  clearConfig(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.SERVICE_ID);
      localStorage.removeItem(STORAGE_KEYS.TEMPLATE_ID);
      localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY);
      window.dispatchEvent(new Event("ht_storage_updated"));
    }
  },

  /**
   * Dispatches the OTP email using EmailJS SDK.
   * If not configured, gracefully provides a simulated dispatch with clear setup instructions.
   */
  async sendOtpEmail({
    toEmail,
    toName,
    otpCode,
    expiresInMinutes = 2,
  }: {
    toEmail: string;
    toName: string;
    otpCode: string;
    expiresInMinutes?: number;
  }): Promise<SendOtpResult> {
    const config = this.getConfig();

    if (!config.publicKey) {
      return {
        success: true,
        provider: "simulated",
        message: `Service (${config.serviceId}) and Template (${config.templateId}) are set! Paste your EmailJS Public Key from dashboard.emailjs.com/admin/account to receive live emails in your inbox.`,
      };
    }

    try {
      // Comprehensive template variable mappings matching standard EmailJS templates
      const templateParams = {
        to_name: toName,
        user_name: toName,
        recipient_name: toName,
        to_email: toEmail,
        recipient_email: toEmail,
        email: toEmail,
        otp_code: otpCode,
        passcode: otpCode,
        pin_code: otpCode,
        otp: otpCode,
        code: otpCode,
        message: `Your ALYN SHIR security verification OTP code is: ${otpCode}. It expires in ${expiresInMinutes} minutes.`,
        subject: `ALYN SHIR Maritime Security OTP: ${otpCode}`,
        expires_in: `${expiresInMinutes} minutes`,
        expires_minutes: expiresInMinutes,
        time_limit: `${expiresInMinutes} minutes`,
        app_name: "ALYN SHIR Luxury Philippine Marine Expeditions",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        reply_to: "security@alynshir.ph",
      };

      let dispatchedVia = "";

      // 1. First attempt via internal server relay (Bypasses browser ad-blockers, tracking protection, and CORS)
      try {
        const relayRes = await fetch("/api/emailjs/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: config.serviceId,
            templateId: config.templateId,
            publicKey: config.publicKey,
            templateParams,
          }),
        });

        if (relayRes.ok) {
          const relayData = (await relayRes.json()) as { success?: boolean };
          if (relayData.success) {
            return {
              success: true,
              provider: "emailjs",
              message: `Real OTP security email dispatched via EmailJS to ${toEmail}.`,
            };
          }
        }
      } catch (relayErr) {
        console.warn("Internal relay dispatch skipped, proceeding to browser SDK:", relayErr);
      }

      // 2. Direct browser SDK dispatch
      let response;
      try {
        response = await emailjs.send(
          config.serviceId,
          config.templateId,
          templateParams,
          config.publicKey
        );
      } catch (initialErr: unknown) {
        // Reciprocal key fallback in case of sans-serif font ambiguity
        const altKey = config.publicKey.startsWith("I")
          ? "l" + config.publicKey.slice(1)
          : config.publicKey.startsWith("l")
          ? "I" + config.publicKey.slice(1)
          : null;

        if (altKey) {
          try {
            response = await emailjs.send(
              config.serviceId,
              config.templateId,
              templateParams,
              altKey
            );
          } catch {
            throw initialErr;
          }
        } else {
          throw initialErr;
        }
      }

      if (response && (response.status === 200 || response.text === "OK")) {
        return {
          success: true,
          provider: "emailjs",
          message: `Real OTP security email dispatched via EmailJS to ${toEmail}.`,
        };
      }

      return {
        success: false,
        provider: "emailjs",
        error: response ? `EmailJS status ${response.status}: ${response.text}` : "No response from EmailJS",
        message: "EmailJS delivery encountered an issue.",
      };
    } catch (err: unknown) {
      let errorMsg = "Unknown EmailJS network error";
      if (err && typeof err === "object") {
        if ("text" in err && typeof (err as { text: unknown }).text === "string") {
          errorMsg = (err as { text: string }).text;
        } else if ("message" in err && typeof (err as { message: unknown }).message === "string") {
          errorMsg = (err as { message: string }).message;
        }
      } else if (typeof err === "string") {
        errorMsg = err;
      }

      console.warn("EmailJS dispatch warning:", err);
      return {
        success: false,
        provider: "emailjs",
        error: errorMsg,
        message: `EmailJS send failed: ${errorMsg}. Please verify your EmailJS keys.`,
      };
    }
  },
};
