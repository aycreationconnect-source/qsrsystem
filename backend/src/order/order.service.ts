import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { items, paymentMethod, subtotal, tax, total } = data;
    
    // Validate
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order must contain items");
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const order = await tx.order.create({
        data: {
          paymentMethod: paymentMethod || 'Cash',
          subtotal: parseFloat(subtotal) || 0,
          tax: parseFloat(tax) || 0,
          total: parseFloat(total) || 0,
          status: 'Completed',
          items: {
            create: items.map(item => ({
              quantity: item.quantity,
              price: parseFloat(item.price) || 0,
              menuItemId: item.menuItemId || item.id
            }))
          }
        },
        include: { items: true }
      });

      // 2. Deduct inventory
      for (const orderItem of items) {
        const menuItemId = orderItem.menuItemId || orderItem.id;
        
        // Find recipe for this menu item
        const recipeIngredients = await tx.recipeIngredient.findMany({
          where: { menuItemId },
          include: { inventory: true }
        });

        for (const recipe of recipeIngredients) {
          const deductionAmount = recipe.quantity * orderItem.quantity;
          
          // Update stock
          const newStock = recipe.inventory.stock - deductionAmount;
          const newStatus = newStock <= recipe.inventory.threshold ? 'Low Stock' : 'Good';
          
          await tx.inventoryItem.update({
            where: { id: recipe.inventoryId },
            data: { 
              stock: newStock,
              status: newStatus
            }
          });

          // Create history log
          await tx.inventoryHistory.create({
            data: {
              inventoryId: recipe.inventoryId,
              change: `-${deductionAmount}`,
              type: `Order #${order.id}`
            }
          });
        }
      }
      
      return order;
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { menuItem: true } } },
      orderBy: { date: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } } }
    });
  }

  update(id: number, data: any) {
    return this.prisma.order.update({
      where: { id },
      data
    });
  }

  remove(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }
}
