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
exports.AddonService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AddonService = class AddonService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.addon.create({
            data: {
                name: data.name,
                description: data.description || null,
                price: parseFloat(String(data.price).replace('₹', '') || '0'),
            },
        });
    }
    async findAll() {
        return this.prisma.addon.findMany({ orderBy: { id: 'asc' } });
    }
    async update(id, data) {
        return this.prisma.addon.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.price !== undefined && { price: parseFloat(String(data.price).replace('₹', '') || '0') }),
            },
        });
    }
    async remove(id) {
        return this.prisma.addon.delete({ where: { id } });
    }
};
exports.AddonService = AddonService;
exports.AddonService = AddonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AddonService);
//# sourceMappingURL=addon.service.js.map