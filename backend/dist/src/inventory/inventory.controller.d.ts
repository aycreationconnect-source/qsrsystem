import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(createInventoryDto: CreateInventoryDto): import("@prisma/client").Prisma.Prisma__InventoryItemClient<{
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
    findOne(id: string): import("@prisma/client").Prisma.Prisma__InventoryItemClient<{
        name: string;
        status: string;
        id: number;
        unit: string;
        stock: number;
        threshold: number;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<{
        name: string;
        status: string;
        id: number;
        unit: string;
        stock: number;
        threshold: number;
    }>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__InventoryItemClient<{
        name: string;
        status: string;
        id: number;
        unit: string;
        stock: number;
        threshold: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
