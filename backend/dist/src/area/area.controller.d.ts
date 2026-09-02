import { AreaService } from './area.service';
export declare class AreaController {
    private readonly areaService;
    constructor(areaService: AreaService);
    create(createAreaDto: any): import("@prisma/client").Prisma.Prisma__AreaClient<{
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
    update(id: string, updateAreaDto: any): import("@prisma/client").Prisma.Prisma__AreaClient<{
        id: number;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__AreaClient<{
        id: number;
        name: string;
        description: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
