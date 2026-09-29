import fs from "fs";
import path from "path";

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

/**
 * Returns active Razorpay credentials.
 * Dynamically reads the .env file from disk to bypass Node.js process.env caching
 * when credentials are updated while the dev server is continuously running.
 */
export function getRazorpayCredentials(): RazorpayCredentials {
  let keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "";
  let keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (process.env.NODE_ENV !== "production") {
    try {
      const candidatePaths = [
        path.join(process.cwd(), ".env"),
        path.join(process.cwd(), "zaa", ".env"),
      ];

      for (const envPath of candidatePaths) {
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf-8");
          const keyIdMatch = content.match(
            /^RAZORPAY_KEY_ID\s*=\s*["']?([^"'\r\n]+)["']?/m
          );
          const keySecretMatch = content.match(
            /^RAZORPAY_KEY_SECRET\s*=\s*["']?([^"'\r\n]+)["']?/m
          );

          if (keyIdMatch && keyIdMatch[1]) {
            keyId = keyIdMatch[1].trim();
          }
          if (keySecretMatch && keySecretMatch[1]) {
            keySecret = keySecretMatch[1].trim();
          }
          break;
        }
      }
    } catch (err) {
      console.error("Warning: Could not read .env from disk, falling back to process.env:", err);
    }
  }

  return {
    keyId: keyId.replace(/^["']|["']$/g, "").trim(),
    keySecret: keySecret.replace(/^["']|["']$/g, "").trim(),
  };
}
