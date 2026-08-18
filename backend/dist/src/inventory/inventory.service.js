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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.inventoryItem.create({
            data: {
                name: data.item || data.name,
                unit: data.unit || 'pcs',
                stock: parseFloat(data.stock) || 0,
                threshold: parseFloat(data.threshold) || 0,
                status: data.status || 'Good'
            }
        });
    }
    async findAll() {
        const items = await this.prisma.inventoryItem.findMany({
            include: { history: true },
            orderBy: { id: 'desc' }
        });
        return items.map(i => ({
            id: i.id,
            item: i.name,
            unit: i.unit,
            stock: i.stock,
            threshold: i.threshold,
            status: i.status,
            history: i.history
        }));
    }
    findOne(id) {
        return this.prisma.inventoryItem.findUnique({ where: { id } });
    }
    async update(id, data) {
        const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
        if (!item)
            throw new Error('Not found');
        const stockChange = parseFloat(data.stock) - item.stock;
        const updated = await this.prisma.inventoryItem.update({
            where: { id },
            data: {
                stock: parseFloat(data.stock),
                threshold: parseFloat(data.threshold),
                status: parseFloat(data.stock) <= parseFloat(data.threshold) ? 'Low Stock' : 'Good'
            }
        });
        if (stockChange !== 0) {
            await this.prisma.inventoryHistory.create({
                data: {
                    inventoryId: id,
                    change: stockChange > 0 ? `+${stockChange}` : `${stockChange}`,
                    type: 'Manual Adjustment'
                }
            });
        }
        return updated;
    }
    remove(id) {
        return this.prisma.inventoryItem.delete({ where: { id } });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map