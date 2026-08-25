"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenuService = class MenuService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        let categoryId = null;
        if (data.category) {
            const cat = await this.prisma.category.findUnique({ where: { name: data.category } });
            if (cat)
                categoryId = cat.id;
        }
        if (!categoryId) {
            const defaultCat = await this.prisma.category.findFirst();
            categoryId = defaultCat ? defaultCat.id : 1;
        }
        const { category, image, available, ingredients, taxes, taxName, ...itemData } = data;
        const menuItem = await this.prisma.menuItem.create({
            data: {
                ...itemData,
                tax: itemData.tax ? parseFloat(itemData.tax) : null,
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
    async update(id, data) {
        let updatedCategoryId = undefined;
        if (data.category) {
            const cat = await this.prisma.category.findUnique({ where: { name: data.category } });
            if (cat)
                updatedCategoryId = cat.id;
        }
        const { category, categoryId, id: itemId, image, available, ingredients, taxes, taxName, ...itemData } = data;
        const menuItem = await this.prisma.menuItem.update({
            where: { id },
            data: {
                ...itemData,
                ...(updatedCategoryId !== undefined && { categoryId: updatedCategoryId }),
                ...(itemData.tax !== undefined && { tax: itemData.tax ? parseFloat(itemData.tax) : null }),
                ...(image !== undefined && { imageUrl: image }),
                ...(available !== undefined && { isAvailable: available }),
                ...(itemData.price !== undefined && { price: parseFloat(String(itemData.price).replace('₹', '') || "0") }),
                ...(itemData.prepTime !== undefined && { prepTime: itemData.prepTime ? parseInt(itemData.prepTime) : null }),
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
    async remove(id) {
        await this.prisma.recipeIngredient.deleteMany({ where: { menuItemId: id } });
        await this.prisma.itemTax.deleteMany({ where: { menuItemId: id } });
        return this.prisma.menuItem.delete({ where: { id } });
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuService);
//# sourceMappingURL=menu.service.js.map