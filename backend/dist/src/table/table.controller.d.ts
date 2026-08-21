import { TableService } from './table.service';
export declare class TableController {
    private readonly tableService;
    constructor(tableService: TableService);
    create(createTableDto: any): import("@prisma/client").Prisma.Prisma__TableClient<{
        name: string;
        status: string;
        id: number;
        seats: number;
        areaId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        area: {
            name: string;
            description: string | null;
            id: number;
        };
    } & {
        name: string;
        status: string;
        id: number;
        seats: number;
        areaId: number;
    })[]>;
    update(id: string, updateTableDto: any): import("@prisma/client").Prisma.Prisma__TableClient<{
        name: string;
        status: string;
        id: number;
        seats: number;
        areaId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__TableClient<{
        name: string;
        status: string;
        id: number;
        seats: number;
        areaId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
