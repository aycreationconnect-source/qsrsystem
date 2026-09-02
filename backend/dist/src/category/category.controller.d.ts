import { CategoryService } from './category.service';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(createCategoryDto: any): import("@prisma/client").Prisma.Prisma__CategoryClient<{
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
    findOne(id: string): null;
    update(id: string, updateCategoryDto: any): import("@prisma/client").Prisma.Prisma__CategoryClient<{
        id: number;
        name: string;
        status: string;
        description: string | null;
        displayOrder: number | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): null;
}
