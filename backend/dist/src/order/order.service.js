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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrderService = class OrderService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const { items, paymentMethod, subtotal, tax, total } = data;
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error("Order must contain items");
        }
        return this.prisma.$transaction(async (tx) => {
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
            for (const orderItem of items) {
                const menuItemId = orderItem.menuItemId || orderItem.id;
                const recipeIngredients = await tx.recipeIngredient.findMany({
                    where: { menuItemId },
                    include: { inventory: true }
                });
                for (const recipe of recipeIngredients) {
                    const deductionAmount = recipe.quantity * orderItem.quantity;
                    const newStock = recipe.inventory.stock - deductionAmount;
                    const newStatus = newStock <= recipe.inventory.threshold ? 'Low Stock' : 'Good';
                    await tx.inventoryItem.update({
                        where: { id: recipe.inventoryId },
                        data: {
                            stock: newStock,
                            status: newStatus
                        }
                    });
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
    findOne(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: { items: { include: { menuItem: true } } }
        });
    }
    update(id, data) {
        return this.prisma.order.update({
            where: { id },
            data
        });
    }
    remove(id) {
        return this.prisma.order.delete({ where: { id } });
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map