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
        const { items, paymentMethod, subtotal, tax, total, payments } = data;
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new common_1.BadRequestException("Order must contain items");
        }
        const orderTotal = parseFloat(total) || 0;
        let initialPayments = [];
        if (payments && Array.isArray(payments) && payments.length > 0) {
            initialPayments = payments.map((p) => ({
                amount: parseFloat(p.amount) || 0,
                paymentMethod: p.paymentMethod || paymentMethod || 'Cash',
                reference: p.reference || null,
            }));
        }
        else {
            initialPayments = [
                {
                    amount: orderTotal,
                    paymentMethod: paymentMethod || 'Cash',
                    reference: null,
                },
            ];
        }
        const totalPaid = initialPayments.reduce((sum, p) => sum + p.amount, 0);
        const balanceDue = Math.max(0, parseFloat((orderTotal - totalPaid).toFixed(2)));
        const finalStatus = balanceDue <= 0 ? 'Completed' : 'Partially Paid';
        const computedMethod = initialPayments.length > 1
            ? 'Split'
            : initialPayments[0]?.paymentMethod || paymentMethod || 'Cash';
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    paymentMethod: computedMethod,
                    subtotal: parseFloat(subtotal) || 0,
                    tax: parseFloat(tax) || 0,
                    total: orderTotal,
                    paidAmount: totalPaid,
                    balanceAmount: balanceDue,
                    status: finalStatus,
                    items: {
                        create: items.map((item) => ({
                            quantity: item.quantity,
                            price: parseFloat(item.price) || 0,
                            menuItemId: item.menuItemId || item.id,
                        })),
                    },
                    payments: {
                        create: initialPayments.map((p) => ({
                            amount: p.amount,
                            paymentMethod: p.paymentMethod,
                            reference: p.reference,
                        })),
                    },
                },
                include: { items: true, payments: true },
            });
            for (const orderItem of items) {
                const menuItemId = orderItem.menuItemId || orderItem.id;
                const recipeIngredients = await tx.recipeIngredient.findMany({
                    where: { menuItemId },
                    include: { inventory: true },
                });
                for (const recipe of recipeIngredients) {
                    const deductionAmount = recipe.quantity * orderItem.quantity;
                    const newStock = recipe.inventory.stock - deductionAmount;
                    const newStatus = newStock <= recipe.inventory.threshold ? 'Low Stock' : 'Good';
                    await tx.inventoryItem.update({
                        where: { id: recipe.inventoryId },
                        data: {
                            stock: newStock,
                            status: newStatus,
                        },
                    });
                    await tx.inventoryHistory.create({
                        data: {
                            inventoryId: recipe.inventoryId,
                            change: `-${deductionAmount}`,
                            type: `Order #${order.id}`,
                        },
                    });
                }
            }
            const startOfDay = new Date(order.date);
            startOfDay.setHours(0, 0, 0, 0);
            const dailyOrderNumber = await tx.order.count({
                where: {
                    date: {
                        gte: startOfDay,
                        lte: order.date,
                    },
                },
            });
            return {
                ...order,
                dailyOrderNumber,
            };
        });
    }
    async findAll() {
        const orders = await this.prisma.order.findMany({
            include: {
                items: { include: { menuItem: true } },
                payments: true,
            },
            orderBy: { date: 'asc' },
        });
        const dayCounters = new Map();
        const withDaily = orders.map((order) => {
            const d = new Date(order.date);
            const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const nextNum = (dayCounters.get(dayStr) || 0) + 1;
            dayCounters.set(dayStr, nextNum);
            return {
                ...order,
                dailyOrderNumber: nextNum,
            };
        });
        return withDaily.reverse();
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { menuItem: true } },
                payments: true,
            },
        });
        if (!order)
            return null;
        const startOfDay = new Date(order.date);
        startOfDay.setHours(0, 0, 0, 0);
        const dailyOrderNumber = await this.prisma.order.count({
            where: {
                date: {
                    gte: startOfDay,
                    lte: order.date,
                },
            },
        });
        return {
            ...order,
            dailyOrderNumber,
        };
    }
    update(id, data) {
        return this.prisma.order.update({
            where: { id },
            data,
            include: { payments: true, items: true },
        });
    }
    remove(id) {
        return this.prisma.order.delete({ where: { id } });
    }
    async addPayment(orderId, paymentDto) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payments: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order #${orderId} not found`);
        }
        const payAmount = parseFloat(String(paymentDto.amount)) || 0;
        if (payAmount <= 0) {
            throw new common_1.BadRequestException("Payment amount must be greater than zero");
        }
        const newPayment = await this.prisma.orderPayment.create({
            data: {
                orderId,
                amount: payAmount,
                paymentMethod: paymentDto.paymentMethod || 'Cash',
                reference: paymentDto.reference || null,
            },
        });
        const allPayments = await this.prisma.orderPayment.findMany({
            where: { orderId },
        });
        const newPaidTotal = allPayments.reduce((sum, p) => sum + p.amount, 0);
        const newBalance = Math.max(0, parseFloat((order.total - newPaidTotal).toFixed(2)));
        const updatedStatus = newBalance <= 0 ? 'Completed' : 'Partially Paid';
        const distinctMethods = [...new Set(allPayments.map((p) => p.paymentMethod))];
        const newPaymentMethod = distinctMethods.length > 1 ? 'Split' : distinctMethods[0] || order.paymentMethod;
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                paidAmount: newPaidTotal,
                balanceAmount: newBalance,
                status: updatedStatus,
                paymentMethod: newPaymentMethod,
            },
            include: { payments: true, items: true },
        });
        return {
            payment: newPayment,
            order: updatedOrder,
            orderSummary: {
                total: updatedOrder.total,
                paidAmount: updatedOrder.paidAmount,
                balanceAmount: updatedOrder.balanceAmount,
                status: updatedOrder.status,
            },
        };
    }
    async getPayments(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payments: { orderBy: { date: 'asc' } } },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order #${orderId} not found`);
        }
        return {
            orderId: order.id,
            total: order.total,
            paidAmount: order.paidAmount,
            balanceAmount: order.balanceAmount,
            status: order.status,
            payments: order.payments,
        };
    }
    async removePayment(orderId, paymentId) {
        const payment = await this.prisma.orderPayment.findUnique({
            where: { id: paymentId },
        });
        if (!payment || payment.orderId !== orderId) {
            throw new common_1.NotFoundException(`Payment installment #${paymentId} not found for Order #${orderId}`);
        }
        await this.prisma.orderPayment.delete({
            where: { id: paymentId },
        });
        const remainingPayments = await this.prisma.orderPayment.findMany({
            where: { orderId },
        });
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        const newPaidTotal = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
        const newBalance = Math.max(0, parseFloat(((order?.total || 0) - newPaidTotal).toFixed(2)));
        const updatedStatus = newPaidTotal <= 0 ? 'Unpaid' : newBalance <= 0 ? 'Completed' : 'Partially Paid';
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                paidAmount: newPaidTotal,
                balanceAmount: newBalance,
                status: updatedStatus,
            },
        });
        return {
            success: true,
            message: `Payment installment #${paymentId} removed.`,
            orderSummary: {
                total: updatedOrder.total,
                paidAmount: updatedOrder.paidAmount,
                balanceAmount: updatedOrder.balanceAmount,
                status: updatedOrder.status,
            },
        };
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map