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
exports.TableService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TableService = class TableService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        if (data.areaId) {
            data.areaId = parseInt(data.areaId);
        }
        return this.prisma.table.create({ data });
    }
    findAll() {
        return this.prisma.table.findMany({ include: { area: true } });
    }
    update(id, data) {
        if (data.areaId) {
            data.areaId = parseInt(data.areaId);
        }
        return this.prisma.table.update({ where: { id }, data });
    }
    remove(id) {
        return this.prisma.table.delete({ where: { id } });
    }
};
exports.TableService = TableService;
exports.TableService = TableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TableService);
//# sourceMappingURL=table.service.js.map