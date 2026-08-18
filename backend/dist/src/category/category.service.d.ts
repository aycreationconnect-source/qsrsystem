import { PrismaService } from '../prisma/prisma.service';
export declare class CategoryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import("@prisma/client").Prisma.Prisma__CategoryClient<{
        name: string;
        description: string | null;
        displayOrder: number | null;
        status: string;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        description: string | null;
        displayOrder: number | null;
        status: string;
        id: number;
    }[]>;
    update(id: number, data: any): import("@prisma/client").Prisma.Prisma__CategoryClient<{
        name: string;
        description: string | null;
        displayOrder: number | null;
        status: string;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
