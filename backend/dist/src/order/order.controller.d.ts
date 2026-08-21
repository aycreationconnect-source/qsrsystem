import { OrderService } from './order.service';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(createOrderDto: any): Promise<{
        items: {
            id: number;
            price: number;
            quantity: number;
            menuItemId: number;
            orderId: number;
        }[];
    } & {
        status: string;
        id: number;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        items: ({
            menuItem: {
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
            };
        } & {
            id: number;
            price: number;
            quantity: number;
            menuItemId: number;
            orderId: number;
        })[];
    } & {
        status: string;
        id: number;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__OrderClient<({
        items: ({
            menuItem: {
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
            };
        } & {
            id: number;
            price: number;
            quantity: number;
            menuItemId: number;
            orderId: number;
        })[];
    } & {
        status: string;
        id: number;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateOrderDto: any): import("@prisma/client").Prisma.Prisma__OrderClient<{
        status: string;
        id: number;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__OrderClient<{
        status: string;
        id: number;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
