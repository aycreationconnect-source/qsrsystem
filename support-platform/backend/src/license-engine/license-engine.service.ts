import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface LicensePayload {
  cafeCode: string;
  businessName: string;
  planCode: string;
  durationDays: number;
  issuedAt: string;
  expiresAt: string;
  maxTerminals: number;
  modules: string[];
  version?: number;
}

export interface VerificationResult {
  isValid: boolean;
  isExpired: boolean;
  daysRemaining: number;
  payload?: LicensePayload;
  error?: string;
}

@Injectable()
export class LicenseEngineService {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.MASTER_LICENSE_SECRET || 'qsr_master_secret_key_aycreationconnect_2026';
  }

  /**
   * Generates a cryptographically signed license key
   */
  generateLicenseKey(data: {
    cafeCode: string;
    businessName: string;
    planCode: string;
    durationDays: number;
    issuedAt: Date;
    expiresAt: Date;
    maxTerminals?: number;
    modules?: string[];
  }): string {
    const payload: LicensePayload = {
      cafeCode: data.cafeCode.toUpperCase(),
      businessName: data.businessName,
      planCode: data.planCode.toUpperCase(),
      durationDays: data.durationDays,
      issuedAt: data.issuedAt.toISOString(),
      expiresAt: data.expiresAt.toISOString(),
      maxTerminals: data.maxTerminals || 10,
      modules: data.modules || ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
      version: 1,
    };

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString, 'utf8').toString('base64url');

    // Create HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(base64Payload);
    const signature = hmac.digest('hex').substring(0, 16).toUpperCase();

    // Format human readable license key
    // E.g. LIC-CF001-90D-E4A28B10-eyJjYWZlQ29...
    const cleanCode = data.cafeCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    return `LIC-${cleanCode}-${data.durationDays}D-${signature}-${base64Payload}`;
  }

  /**
   * Verifies an offline license key and extracts data
   */
  verifyLicenseKey(licenseKey: string): VerificationResult {
    try {
      if (!licenseKey || !licenseKey.startsWith('LIC-')) {
        return { isValid: false, isExpired: true, daysRemaining: 0, error: 'Invalid license format' };
      }

      const parts = licenseKey.split('-');
      if (parts.length < 5) {
        return { isValid: false, isExpired: true, daysRemaining: 0, error: 'Malformed license structure' };
      }

      // Reconstruct components
      // parts[0] = "LIC", parts[1] = cleanCode, parts[2] = duration, parts[3] = signature, parts[4] = base64Payload
      const providedSignature = parts[3];
      const base64Payload = parts.slice(4).join('-'); // handles any hyphens in base64url

      // Verify signature
      const hmac = crypto.createHmac('sha256', this.secretKey);
      hmac.update(base64Payload);
      const expectedSignature = hmac.digest('hex').substring(0, 16).toUpperCase();

      if (providedSignature !== expectedSignature) {
        return { isValid: false, isExpired: true, daysRemaining: 0, error: 'Cryptographic signature mismatch / Tampered key' };
      }

      const payloadString = Buffer.from(base64Payload, 'base64url').toString('utf8');
      const payload: LicensePayload = JSON.parse(payloadString);

      const now = new Date();
      const expiry = new Date(payload.expiresAt);
      const diffMs = expiry.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isExpired = daysRemaining <= 0;

      return {
        isValid: true,
        isExpired,
        daysRemaining: Math.max(0, daysRemaining),
        payload,
      };
    } catch (err: any) {
      return {
        isValid: false,
        isExpired: true,
        daysRemaining: 0,
        error: `Verification error: ${err.message}`,
      };
    }
  }
}
