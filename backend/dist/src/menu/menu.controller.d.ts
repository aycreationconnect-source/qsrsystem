import { MenuService } from './menu.service';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    create(createMenuDto: any): Promise<{
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
        categoryId: number;
    }[]>;
    findOne(id: string): null;
    update(id: string, updateMenuDto: any): Promise<{
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
        categoryId: number;
    }>;
    remove(id: string): null;
}
