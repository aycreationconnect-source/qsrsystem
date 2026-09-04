import { BadRequestException } from '@nestjs/common';
import { LicenseVerifierService } from './license-verifier.service';
import * as crypto from 'crypto';

describe('LicenseVerifierService (Automation Testing)', () => {
  let service: LicenseVerifierService;
  const MASTER_SALT = 'QSR_MASTER_GOLDEN_SECRET_2026_AY_CONNECT';

  beforeEach(() => {
    service = new LicenseVerifierService();
  });

  const createValidToken = (cafeCode: string, days = 90, isExpired = false) => {
    const now = new Date();
    const expiry = new Date(now);
    if (isExpired) {
      expiry.setDate(expiry.getDate() - 5);
    } else {
      expiry.setDate(expiry.getDate() + days);
    }

    const payload = {
      cafeCode,
      businessName: 'Test Cafe',
      planCode: 'GOLD_DINE_IN',
      durationDays: days,
      issuedAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      maxTerminals: 5,
      modules: ['COUNTER_POS', 'TABLE_POS'],
    };

    const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const hmac = crypto.createHmac('sha256', MASTER_SALT);
    hmac.update(b64Payload);
    const signature = hmac.digest('hex').substring(0, 16).toUpperCase();

    const cleanCode = cafeCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return `LIC-${cleanCode}-${days}D-${signature}-${b64Payload}`;
  };

  it('should successfully verify a valid cryptographic license key', () => {
    const key = createValidToken('CF-MUM-001', 90);
    const result = service.verifyLicenseKey(key, 'CF-MUM-001');

    expect(result.isValid).toBe(true);
    expect(result.payload.cafeCode).toBe('CF-MUM-001');
    expect(result.durationDays).toBe(90);
    expect(result.payload.businessName).toBe('Test Cafe');
  });

  it('should reject a license key with mismatched cafeCode', () => {
    const key = createValidToken('CF-MUM-001', 90);
    expect(() => service.verifyLicenseKey(key, 'CF-DEL-999')).toThrow(BadRequestException);
  });

  it('should detect and reject tampered mathematical signatures', () => {
    const key = createValidToken('CF-MUM-001', 90);
    const parts = key.split('-');
    parts[3] = 'DEADBEEF12345678'; // Corrupted signature
    const tamperedKey = parts.join('-');

    expect(() => service.verifyLicenseKey(tamperedKey, 'CF-MUM-001')).toThrow(BadRequestException);
  });

  it('should reject expired licenses', () => {
    const expiredKey = createValidToken('CF-MUM-001', 90, true);
    expect(() => service.verifyLicenseKey(expiredKey, 'CF-MUM-001')).toThrow(BadRequestException);
  });

  it('should reject malformed or non-LIC tokens', () => {
    expect(() => service.verifyLicenseKey('INVALID-TOKEN', 'CF-MUM-001')).toThrow(BadRequestException);
    expect(() => service.verifyLicenseKey('', 'CF-MUM-001')).toThrow(BadRequestException);
  });
});
