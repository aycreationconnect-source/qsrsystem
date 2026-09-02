import { PrismaService } from '../prisma/prisma.service';
export declare class CategoryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__CategoryClient<{
        id: number;
        name: string;
        status: string;
        description: string | null;
        displayOrder: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        status: string;
        description: string | null;
        displayOrder: number | null;
    }[]>;
    update(id: number, data: any): import("@prisma/client").Prisma.Prisma__CategoryClient<{
        id: number;
        name: string;
        status: string;
        description: string | null;
        displayOrder: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
