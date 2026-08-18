import { CategoryService } from './category.service';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(createCategoryDto: any): import("@prisma/client").Prisma.Prisma__CategoryClient<{
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
    findOne(id: string): null;
    update(id: string, updateCategoryDto: any): import("@prisma/client").Prisma.Prisma__CategoryClient<{
        name: string;
        description: string | null;
        displayOrder: number | null;
        status: string;
        id: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): null;
}
