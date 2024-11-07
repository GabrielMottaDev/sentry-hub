// import { totp } from 'otplib';
import {
  Authenticator,
  AuthenticatorOptions,
  authenticatorToken,
  HashAlgorithms,
  KeyEncodings,
  TOTP,
  totpOptions,
  TOTPOptions,
  totpTimeRemaining,
  totpToken,
} from "@otplib/core";
import { keyDecoder, keyEncoder } from "@otplib/plugin-base32-enc-dec";
import { createDigest, createRandomBytes } from "@otplib/plugin-crypto-js";
import { totp } from "otplib";

const alphanumericSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHANUMERIC_LENGTH = 6;

export class OtpService {
  private secret: string;
  private static readonly NUMERIC_LENGTH = Math.floor(
    Math.log10(Math.pow(alphanumericSet.length, ALPHANUMERIC_LENGTH))
  );
  private totp: TOTP;

  constructor(secret: string) {
    this.secret = keyDecoder(secret, KeyEncodings.HEX);
    this.totp = new TOTP<TOTPOptions>({
      createDigest,
      encoding: KeyEncodings.HEX,
      digits: OtpService.NUMERIC_LENGTH,
      // This allows for a 1 prior and 1 future token
      window: 1,
      // 30 seconds interval
      step: 30,
    });
  }

  // Get time remaining for OTP validity
  timeRemaining(): number {
    return this.totp.timeRemaining();
  }

  timeUsed(): number {
    return this.totp.timeUsed();
  }

  // Verify the OTP token
  verify(token: string): boolean {
    return this.totp.check(token, this.secret);
  }

  generateAlphanumericOtp(): string {
    return this.convertToAlphanumeric(this.generateNumericOtp());
  }

  // Generate numeric OTP
  generateNumericOtp(): string {
    return this.totp.generate(this.secret);
  }

  // Convert numeric OTP to fixed-length alphanumeric OTP
  convertToAlphanumeric(numericOtp: string): string {
    let decimalValue = BigInt(numericOtp);
    let alphanumericOtp = "";

    // Base 36 encoding
    while (decimalValue > 0) {
      const remainder = decimalValue % BigInt(alphanumericSet.length);
      alphanumericOtp = alphanumericSet[Number(remainder)] + alphanumericOtp;
      decimalValue = decimalValue / BigInt(alphanumericSet.length);
    }

    // Pad to ensure fixed length
    while (alphanumericOtp.length < ALPHANUMERIC_LENGTH) {
      alphanumericOtp = "0" + alphanumericOtp;
    }

    return alphanumericOtp.slice(-ALPHANUMERIC_LENGTH);
  }

  // Convert alphanumeric OTP back to numeric OTP
  convertAlphanumericToNumeric(alphanumericOtp: string): string {
    let decimalValue = BigInt(0);

    // Base 36 decoding
    for (let i = 0; i < alphanumericOtp.length; i++) {
      const index = BigInt(alphanumericSet.indexOf(alphanumericOtp[i]));
      decimalValue = decimalValue * BigInt(alphanumericSet.length) + index;
    }

    // Convert BigInt back to string and pad to ensure original length
    return decimalValue.toString().padStart(OtpService.NUMERIC_LENGTH, "0");
  }

  // Run test loop to verify OTP consistency
  static testOtpGeneration() {
    for (let i = 0; i < 50000; i++) {
      const secret = "JBSWY3DPEHPK3PXP" + Date.now() + Math.random();
      const generator = new OtpService(secret);
      const numericOtp = generator.generateNumericOtp();
      const alphanumericOtp = generator.convertToAlphanumeric(numericOtp);
      const restoredNumericOtp =
        generator.convertAlphanumericToNumeric(alphanumericOtp);

      if (restoredNumericOtp !== numericOtp) {
        console.log("Mismatch found!");
        console.log(`Numeric OTP: ${numericOtp}`);
        console.log(`Fixed-Length Alphanumeric OTP: ${alphanumericOtp}`);
        console.log(`Restored Numeric OTP: ${restoredNumericOtp}`);
        console.log(`Verification: ${generator.verify(restoredNumericOtp)}`);
      }
    }
  }
}
