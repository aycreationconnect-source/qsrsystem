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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingController = class SettingController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        const settings = await this.prisma.setting.findMany();
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
    }
    async saveSettings(body) {
        for (const [key, value] of Object.entries(body)) {
            await this.prisma.setting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            });
        }
        return { success: true };
    }
    async getStoreProfile() {
        return this.prisma.storeProfile.findFirst();
    }
    async updateStoreProfile(body) {
        const existing = await this.prisma.storeProfile.findFirst();
        if (!existing) {
            return { success: false, message: 'Store profile not found' };
        }
        const updated = await this.prisma.storeProfile.update({
            where: { id: existing.id },
            data: {
                businessName: body.businessName !== undefined ? body.businessName : existing.businessName,
                ownerName: body.ownerName !== undefined ? body.ownerName : existing.ownerName,
                phone: body.phone !== undefined ? body.phone : existing.phone,
                email: body.email !== undefined ? body.email : existing.email,
                city: body.city !== undefined ? body.city : existing.city,
                state: body.state !== undefined ? body.state : existing.state,
                address: body.address !== undefined ? body.address : existing.address,
                gstin: body.gstin !== undefined ? body.gstin : existing.gstin,
                receiptFooter: body.receiptFooter !== undefined ? body.receiptFooter : existing.receiptFooter,
                logoUrl: body.logoUrl !== undefined ? body.logoUrl : existing.logoUrl,
            },
        });
        return { success: true, store: updated };
    }
};
exports.SettingController = SettingController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "saveSettings", null);
__decorate([
    (0, common_1.Get)('profile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "getStoreProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingController.prototype, "updateStoreProfile", null);
exports.SettingController = SettingController = __decorate([
    (0, common_1.Controller)('setting'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingController);
//# sourceMappingURL=setting.controller.js.map