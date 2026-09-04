import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService (Automation Testing)', () => {
  let service: AuthService;
  let prisma: any;

  const mockStore = {
    id: 'store-1',
    cafeCode: 'CF-MUM-001',
    businessName: 'Downtown Brew',
    currencySymbol: '₹',
    receiptFooter: 'Thank you!',
    isActivated: true,
  };

  const mockLicense = {
    id: 'lic-1',
    planCode: 'GOLD_DINE_IN',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days ahead
    lastKnownClock: new Date(Date.now() - 60000), // 1 min ago
    allowedModules: ['COUNTER_POS', 'TABLE_POS'],
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    prisma = {
      storeProfile: { findFirst: jest.fn().mockResolvedValue(mockStore) },
      localLicense: {
        findFirst: jest.fn().mockResolvedValue(mockLicense),
        update: jest.fn().mockResolvedValue(mockLicense),
      },
      localUser: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should authenticate user with valid 4-digit PIN', async () => {
    prisma.localUser.findFirst.mockResolvedValue({
      id: '1001',
      username: 'cashier1',
      fullName: 'Counter Cashier',
      role: 'CASHIER',
      isActive: true,
    });

    const res = await service.login({ pin: '1111' });

    expect(res.success).toBe(true);
    expect(res.token).toBeDefined();
    expect(res.user.username).toBe('cashier1');
    expect(res.store.cafeCode).toBe('CF-MUM-001');
    expect(res.license.planCode).toBe('GOLD_DINE_IN');
  });

  it('should reject login if store is not activated', async () => {
    prisma.storeProfile.findFirst.mockResolvedValue(null);

    await expect(service.login({ pin: '1111' })).rejects.toThrow(ForbiddenException);
  });

  it('should trigger clock tampering protection if system clock moved backwards', async () => {
    // Clock in license is ahead of current time
    prisma.localLicense.findFirst.mockResolvedValue({
      ...mockLicense,
      lastKnownClock: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    });

    await expect(service.login({ pin: '1111' })).rejects.toThrow(ForbiddenException);
  });

  it('should reject login if license has expired', async () => {
    prisma.localLicense.findFirst.mockResolvedValue({
      ...mockLicense,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      lastKnownClock: new Date(Date.now() - 48 * 60 * 60 * 1000),
    });

    await expect(service.login({ pin: '1111' })).rejects.toThrow(ForbiddenException);
  });

  it('should reject login with wrong PIN or credentials', async () => {
    prisma.localUser.findFirst.mockResolvedValue(null);

    await expect(service.login({ pin: '9999' })).rejects.toThrow(UnauthorizedException);
  });

  it('should decode and verify valid local JWT profile', async () => {
    prisma.localUser.findFirst.mockResolvedValue({
      id: '1001',
      username: 'cashier1',
      fullName: 'Counter Cashier',
      role: 'CASHIER',
      isActive: true,
    });

    const loginRes = await service.login({ pin: '1111' });
    const profile = await service.getProfile(loginRes.token);

    expect(profile.sub).toBe('1001');
    expect(profile.username).toBe('cashier1');
    expect(profile.role).toBe('CASHIER');
    expect(profile.cafeCode).toBe('CF-MUM-001');
  });

  it('should create new staff member with hashed PIN', async () => {
    prisma.localUser.create.mockImplementation(({ data }: any) => {
      return Promise.resolve({
        id: data.id,
        username: data.username,
        fullName: data.fullName,
        role: data.role,
      });
    });

    const staff = await service.createStaff({
      username: 'waiter3',
      fullName: 'New Waiter',
      pin: '5566',
      role: 'WAITER',
    });

    expect(staff.username).toBe('waiter3');
    expect(staff.role).toBe('WAITER');
    expect(prisma.localUser.create).toHaveBeenCalled();
  });
});
