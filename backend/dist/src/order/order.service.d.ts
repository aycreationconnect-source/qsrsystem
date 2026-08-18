import { PrismaService } from '../prisma/prisma.service';
export declare class OrderService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
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
    findOne(id: number): import("@prisma/client").Prisma.Prisma__OrderClient<({
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
    update(id: number, data: any): import("@prisma/client").Prisma.Prisma__OrderClient<{
        status: string;
        id: number;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__OrderClient<{
        status: string;
        id: number;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
