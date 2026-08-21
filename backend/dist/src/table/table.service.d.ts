import { PrismaService } from '../prisma/prisma.service';
export declare class TableService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__TableClient<{
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
    update(id: number, data: any): import("@prisma/client").Prisma.Prisma__TableClient<{
        name: string;
        status: string;
        id: number;
        seats: number;
        areaId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__TableClient<{
        name: string;
        status: string;
        id: number;
        seats: number;
        areaId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
