import { AreaService } from './area.service';
export declare class AreaController {
    private readonly areaService;
    constructor(areaService: AreaService);
    create(createAreaDto: any): import("@prisma/client").Prisma.Prisma__AreaClient<{
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
    update(id: string, updateAreaDto: any): import("@prisma/client").Prisma.Prisma__AreaClient<{
        name: string;
        description: string | null;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__AreaClient<{
        name: string;
        description: string | null;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
