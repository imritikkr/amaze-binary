import "dotenv/config";

import { generateEmailOtp } from "./src/lib/verification/otp";
import { sendVerificationOtp } from "./src/lib/resend/otp";

async function main() {
  const otp = generateEmailOtp();

  console.log("Generated OTP successfully.");

  const result = await sendVerificationOtp({
    email: "iritikdev@gmail.com",
    name: "Amaze Ayurveda User",
    otp,
  });

  console.log("Email sent:", result.success);
}

main().catch((error) => {
  console.error("Test failed:", error.message);
  process.exit(1);
});
