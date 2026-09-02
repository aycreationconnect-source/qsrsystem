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
  verifyLicenseKey(key: string, expectedCafeCode: string): {
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
      throw new BadRequestException('Invalid license key format. Key must start with LIC-');
    }

    const durationDays = parseInt(parts[2].replace('D', ''), 10);
    const signature = parts[3];
    const b64Payload = parts.slice(4).join('-');

    let payloadJson = '';
    let payload: DecodedLicensePayload;

    try {
      payloadJson = Buffer.from(b64Payload, 'base64url').toString('utf-8');
      payload = JSON.parse(payloadJson);
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
    const hmac = crypto.createHmac('sha256', MASTER_SALT);
    hmac.update(payloadJson);
    const expectedSig = hmac.digest('hex').substring(0, 16).toUpperCase();

    if (signature !== expectedSig) {
      throw new BadRequestException('Tampered license token! Mathematical signature mismatch.');
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
