import { PrismaService } from '../prisma/prisma.service';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: number;
        name: string;
        status: string;
        description: string | null;
        imageUrl: string | null;
        price: number;
        tax: number | null;
        sku: string | null;
        prepTime: number | null;
        isAvailable: boolean;
        type: string;
        isAddon: boolean;
        addonIds: string | null;
        categoryId: number;
    }>;
    findAll(): Promise<{
        ingredients: {
            name: string;
            quantity: string;
            unit: string;
        }[];
        category: {
            id: number;
            name: string;
            status: string;
            description: string | null;
            displayOrder: number | null;
        };
        taxes: {
            id: number;
            name: string;
            menuItemId: number;
            rate: number;
        }[];
        id: number;
        name: string;
        status: string;
        description: string | null;
        imageUrl: string | null;
        price: number;
        tax: number | null;
        sku: string | null;
        prepTime: number | null;
        isAvailable: boolean;
        type: string;
        isAddon: boolean;
        addonIds: string | null;
        categoryId: number;
    }[]>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        status: string;
        description: string | null;
        imageUrl: string | null;
        price: number;
        tax: number | null;
        sku: string | null;
        prepTime: number | null;
        isAvailable: boolean;
        type: string;
        isAddon: boolean;
        addonIds: string | null;
        categoryId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        status: string;
        description: string | null;
        imageUrl: string | null;
        price: number;
        tax: number | null;
        sku: string | null;
        prepTime: number | null;
        isAvailable: boolean;
        type: string;
        isAddon: boolean;
        addonIds: string | null;
        categoryId: number;
    }>;
}
