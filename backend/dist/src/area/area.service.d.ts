import { PrismaService } from '../prisma/prisma.service';
export declare class AreaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__AreaClient<{
        name: string;
        description: string | null;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        tables: {
            name: string;
            status: string;
            id: number;
            seats: number;
            areaId: number;
        }[];
    } & {
        name: string;
        description: string | null;
        id: number;
    })[]>;
    update(id: number, data: any): import("@prisma/client").Prisma.Prisma__AreaClient<{
        name: string;
        description: string | null;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__AreaClient<{
        name: string;
        description: string | null;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
