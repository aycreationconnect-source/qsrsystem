import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            orderItem: { deleteMany: jest.fn() },
            order: { deleteMany: jest.fn() },
            recipeIngredient: { deleteMany: jest.fn() },
            inventoryHistory: { deleteMany: jest.fn() },
            menuItem: { deleteMany: jest.fn() },
            category: { deleteMany: jest.fn() },
            inventoryItem: { deleteMany: jest.fn() },
            table: { deleteMany: jest.fn() },
            area: { deleteMany: jest.fn() },
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
