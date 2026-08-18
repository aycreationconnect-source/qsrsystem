import { PrismaService } from '../prisma/prisma.service';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__InventoryItemClient<{
        name: string;
        status: string;
        id: number;
        unit: string;
        stock: number;
        threshold: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): Promise<{
        id: number;
        item: string;
        unit: string;
        stock: number;
        threshold: number;
        status: string;
        history: {
            id: number;
            type: string;
            inventoryId: number;
            date: Date;
            change: string;
        }[];
    }[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__InventoryItemClient<{
        name: string;
        status: string;
        id: number;
        unit: string;
        stock: number;
        threshold: number;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: any): Promise<{
        name: string;
        status: string;
        id: number;
        unit: string;
        stock: number;
        threshold: number;
    }>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__InventoryItemClient<{
        name: string;
        status: string;
        id: number;
        unit: string;
        stock: number;
        threshold: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
