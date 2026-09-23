import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

const MASTER_SALT = 'QSR_MASTER_GOLDEN_SECRET_2026_AY_CONNECT';

export interface DecodedLicensePayload {
  cafeCode: string;
  businessName: string;
  planCode: string;
  durationDays: number;
  issuedAt: string;
  expiresAt: string;
  maxTerminals: number;
  modules: string[];
}

@Injectable()
export class LicenseVerifierService {
  /**
   * Verifies an offline cryptographic license key against the expected cafe code.
   * Format: LIC-<CLEAN_CODE>-<DAYS>D-<SIG_16>-<PAYLOAD_BASE64URL>
   */
  verifyLicenseKey(
    key: string,
    expectedCafeCode: string,
  ): {
    isValid: boolean;
    payload: DecodedLicensePayload;
    expiresAt: Date;
    durationDays: number;
  } {
    if (!key || typeof key !== 'string') {
      throw new BadRequestException('License key string is required.');
    }

    const trimmed = key.trim();
    const parts = trimmed.split('-');
    if (parts.length < 5 || parts[0] !== 'LIC') {
      throw new BadRequestException(
        'Invalid license key format. Key must start with LIC-',
      );
    }

    const durationDays = parseInt(parts[2].replace('D', ''), 10);
    const signature = parts[3];
    const b64Payload = parts.slice(4).join('-');

    let payloadJson = '';
    let payload: DecodedLicensePayload;

    try {
      payloadJson = Buffer.from(b64Payload, 'base64url').toString('utf-8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload = JSON.parse(payloadJson);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new BadRequestException('Malformed license token payload.');
    }

    // 1. Cafe Code match
    const cleanExpected = expectedCafeCode.trim().toUpperCase();
    const cleanInPayload = payload.cafeCode.trim().toUpperCase();
    if (cleanInPayload !== cleanExpected) {
      throw new BadRequestException(
        `License key belongs to store '${payload.cafeCode}', not '${expectedCafeCode}'`,
      );
    }

    // 2. Signature verification with HMAC-SHA256
    const envSecret = process.env.MASTER_LICENSE_SECRET?.replace(
      /^["']|["']$/g,
      '',
    ).trim();
    const candidateSecrets = [
      envSecret,
      MASTER_SALT,
      'qsr_master_secret_key_aycreationconnect_2026',
    ].filter(Boolean) as string[];

    let isSignatureMatch = false;
    for (const secret of candidateSecrets) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(b64Payload);
      if (signature === hmac.digest('hex').substring(0, 16).toUpperCase()) {
        isSignatureMatch = true;
        break;
      }

      // Check fallback legacy hashing against JSON payload if applicable
      const legacyHmac = crypto.createHmac('sha256', secret);
      legacyHmac.update(payloadJson);
      if (
        signature === legacyHmac.digest('hex').substring(0, 16).toUpperCase()
      ) {
        isSignatureMatch = true;
        break;
      }
    }

    if (!isSignatureMatch) {
      throw new BadRequestException(
        'Tampered license token! Mathematical signature mismatch.',
      );
    }

    // 3. Expiration check
    const expiresAt = new Date(payload.expiresAt);
    const now = new Date();
    if (now > expiresAt) {
      throw new BadRequestException(
        `License has expired on ${expiresAt.toLocaleDateString()}. Please provide a valid renewal key.`,
      );
    }

    return {
      isValid: true,
      payload,
      expiresAt,
      durationDays: payload.durationDays || durationDays,
    };
  }
}
