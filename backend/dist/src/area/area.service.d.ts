import { PrismaService } from '../prisma/prisma.service';
export declare class AreaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__AreaClient<{
        id: number;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        tables: {
            id: number;
            name: string;
            status: string;
            seats: number;
            areaId: number;
        }[];
    } & {
        id: number;
        name: string;
        description: string | null;
    })[]>;
    update(id: number, data: any): import("@prisma/client").Prisma.Prisma__AreaClient<{
        id: number;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__AreaClient<{
        id: number;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
