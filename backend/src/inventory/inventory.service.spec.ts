import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryService (KOT Stock Engine)', () => {
  let service: InventoryService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      inventoryItem: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      inventoryCategory: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      recipeIngredient: {
        findMany: jest.fn(),
      },
      inventoryHistory: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deductStockForItems', () => {
    it('should deduct ingredient stocks and write audit log with negative change', async () => {
      const mockRecipe = [
        {
          id: 1,
          quantity: 2, // 2 cheese slices per burger
          menuItemId: 10,
          inventoryId: 30,
          inventory: { id: 30, name: 'Cheese Slices', stock: 100, threshold: 10 },
        },
      ];

      const txMock = {
        recipeIngredient: {
          findMany: jest.fn().mockResolvedValue(mockRecipe),
        },
        inventoryItem: {
          update: jest.fn().mockResolvedValue({ id: 30, stock: 94, status: 'Good' }),
        },
        inventoryHistory: {
          create: jest.fn().mockResolvedValue({ id: 1 }),
        },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(txMock));

      const result = await service.deductStockForItems(
        [{ menuItemId: 10, quantity: 3 }],
        'KOT: Table 1 - Burger x3'
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);

      // 3 burgers * 2 cheese = 6 cheese deducted (100 - 6 = 94)
      expect(txMock.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 30 },
        data: { stock: 94, status: 'Good' },
      });

      expect(txMock.inventoryHistory.create).toHaveBeenCalledWith({
        data: {
          inventoryId: 30,
          change: '-6',
          type: 'KOT: Table 1 - Burger x3',
        },
      });
    });
  });

  describe('revertStockForItems', () => {
    it('should revert ingredient stocks and write audit log with positive change', async () => {
      const mockRecipe = [
        {
          id: 1,
          quantity: 2,
          menuItemId: 10,
          inventoryId: 30,
          inventory: { id: 30, name: 'Cheese Slices', stock: 94, threshold: 10 },
        },
      ];

      const txMock = {
        recipeIngredient: {
          findMany: jest.fn().mockResolvedValue(mockRecipe),
        },
        inventoryItem: {
          update: jest.fn().mockResolvedValue({ id: 30, stock: 100, status: 'Good' }),
        },
        inventoryHistory: {
          create: jest.fn().mockResolvedValue({ id: 2 }),
        },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(txMock));

      const result = await service.revertStockForItems(
        [{ menuItemId: 10, quantity: 3 }],
        'KOT Cancelled: Table 1'
      );

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);

      // 3 burgers * 2 cheese = 6 cheese reverted (94 + 6 = 100)
      expect(txMock.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 30 },
        data: { stock: 100, status: 'Good' },
      });

      expect(txMock.inventoryHistory.create).toHaveBeenCalledWith({
        data: {
          inventoryId: 30,
          change: '+6',
          type: 'KOT Cancelled: Table 1',
        },
      });
    });
  });
});
