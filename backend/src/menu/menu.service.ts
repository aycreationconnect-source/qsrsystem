import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Look up categoryId by category name since frontend sends category name
    let categoryId: number | null = null;
    if (data.category) {
      const cat = await this.prisma.category.findUnique({ where: { name: data.category }});
      if (cat) categoryId = cat.id;
    }
    
    // If we couldn't find the category, link to a default or skip
    if (!categoryId) {
       const defaultCat = await this.prisma.category.findFirst();
       categoryId = defaultCat ? defaultCat.id : 1;
    }

    const { category, image, available, ingredients, taxes, ...itemData } = data; // Remove unmapped fields

    const menuItem = await this.prisma.menuItem.create({
      data: {
        ...itemData,
        imageUrl: image,
        isAvailable: available !== undefined ? available : true,
        price: parseFloat(String(itemData.price).replace('₹', '') || "0"),
        prepTime: itemData.prepTime ? parseInt(itemData.prepTime) : null,
        categoryId
      }
    });

    if (ingredients && Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        let invItem = await this.prisma.inventoryItem.findFirst({ where: { name: ing.name } });
        if (!invItem) {
          invItem = await this.prisma.inventoryItem.create({
            data: { name: ing.name, unit: ing.unit || 'pcs', stock: 0, threshold: 0, status: 'Good' }
          });
        }
        await this.prisma.recipeIngredient.create({
          data: {
            quantity: parseFloat(String(ing.quantity)) || 1,
            menuItemId: menuItem.id,
            inventoryId: invItem.id
          }
        });
      }
    }

    if (taxes && Array.isArray(taxes)) {
      for (const tax of taxes) {
        await this.prisma.itemTax.create({
          data: {
            name: tax.name,
            rate: parseFloat(tax.rate) || 0,
            menuItemId: menuItem.id
          }
        });
      }
    }

    return menuItem;
  }

  async findAll() {
    const items = await this.prisma.menuItem.findMany({ 
      include: { 
        category: true,
        ingredients: { include: { inventory: true } },
        taxes: true
      } 
    });

    return items.map(item => ({
      ...item,
      ingredients: item.ingredients.map(ri => ({
        name: ri.inventory.name,
        quantity: ri.quantity.toString(),
        unit: ri.inventory.unit
      }))
    }));
  }

  async update(id: number, data: any) {
    const { category, categoryId, id: itemId, image, available, ingredients, taxes, ...itemData } = data;
    
    const menuItem = await this.prisma.menuItem.update({
      where: { id },
      data: {
        ...itemData,
        ...(image !== undefined && { imageUrl: image }),
        ...(available !== undefined && { isAvailable: available }),
        price: parseFloat(String(itemData.price).replace('₹', '') || "0"),
        prepTime: itemData.prepTime ? parseInt(itemData.prepTime) : null,
      }
    });

    if (ingredients && Array.isArray(ingredients)) {
      await this.prisma.recipeIngredient.deleteMany({ where: { menuItemId: id } });
      for (const ing of ingredients) {
        let invItem = await this.prisma.inventoryItem.findFirst({ where: { name: ing.name } });
        if (!invItem) {
          invItem = await this.prisma.inventoryItem.create({
            data: { name: ing.name, unit: ing.unit || 'pcs', stock: 0, threshold: 0, status: 'Good' }
          });
        }
        await this.prisma.recipeIngredient.create({
          data: {
            quantity: parseFloat(String(ing.quantity)) || 1,
            menuItemId: id,
            inventoryId: invItem.id
          }
        });
      }
    }

    if (taxes && Array.isArray(taxes)) {
      await this.prisma.itemTax.deleteMany({ where: { menuItemId: id } });
      for (const tax of taxes) {
        await this.prisma.itemTax.create({
          data: {
            name: tax.name,
            rate: parseFloat(tax.rate) || 0,
            menuItemId: id
          }
        });
      }
    }

    return menuItem;
  }

  async remove(id: number) {
    await this.prisma.recipeIngredient.deleteMany({ where: { menuItemId: id } });
    await this.prisma.itemTax.deleteMany({ where: { menuItemId: id } });
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
