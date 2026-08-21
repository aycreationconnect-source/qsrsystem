import { PrismaService } from '../prisma/prisma.service';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        name: string;
        description: string | null;
        status: string;
        id: number;
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
            name: string;
            description: string | null;
            displayOrder: number | null;
            status: string;
            id: number;
        };
        taxes: {
            name: string;
            id: number;
            menuItemId: number;
            rate: number;
        }[];
        name: string;
        description: string | null;
        status: string;
        id: number;
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
        name: string;
        description: string | null;
        status: string;
        id: number;
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
        name: string;
        description: string | null;
        status: string;
        id: number;
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
