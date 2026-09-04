import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrderService (Automation Testing)', () => {
  let service: OrderService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should throw an error if items array is empty or missing', async () => {
    await expect(service.create({ items: [] })).rejects.toThrow('Order must contain items');
    await expect(service.create({})).rejects.toThrow('Order must contain items');
  });

  it('should create order, deduct inventory, and record inventory history', async () => {
    const mockOrder = {
      id: 501,
      paymentMethod: 'UPI',
      subtotal: 300,
      tax: 15,
      total: 315,
      items: [{ id: 1, quantity: 2, price: 150, menuItemId: 10 }],
    };

    const mockRecipe = [
      {
        id: 1,
        quantity: 1, // 1 bun per burger
        menuItemId: 10,
        inventoryId: 20,
        inventory: { id: 20, name: 'Burger Buns', stock: 50, threshold: 10 },
      },
    ];

    const txMock = {
      order: {
        create: jest.fn().mockResolvedValue(mockOrder),
      },
      recipeIngredient: {
        findMany: jest.fn().mockResolvedValue(mockRecipe),
      },
      inventoryItem: {
        update: jest.fn().mockResolvedValue({ id: 20, stock: 48, status: 'Good' }),
      },
      inventoryHistory: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    prisma.$transaction.mockImplementation(async (cb: any) => cb(txMock));

    const result = await service.create({
      items: [{ id: 10, menuItemId: 10, quantity: 2, price: 150 }],
      paymentMethod: 'UPI',
      subtotal: 300,
      tax: 15,
      total: 315,
    });

    expect(result.id).toBe(501);
    expect(txMock.order.create).toHaveBeenCalled();
    // 2 burgers x 1 bun = 2 buns deducted (50 - 2 = 48)
    expect(txMock.inventoryItem.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { stock: 48, status: 'Good' },
    });
    // Inventory audit log created
    expect(txMock.inventoryHistory.create).toHaveBeenCalledWith({
      data: {
        inventoryId: 20,
        change: '-2',
        type: 'Order #501',
      },
    });
  });

  it('should list all orders sorted by date desc', async () => {
    prisma.order.findMany.mockResolvedValue([
      { id: 2, total: 200 },
      { id: 1, total: 150 },
    ]);

    const list = await service.findAll();
    expect(list.length).toBe(2);
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      include: {
        items: { include: { menuItem: true } },
        payments: true,
      },
      orderBy: { date: 'desc' },
    });
  });
});
