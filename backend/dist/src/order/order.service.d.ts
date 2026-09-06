import { PrismaService } from '../prisma/prisma.service';
export declare class OrderService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        dailyOrderNumber: number;
        items: {
            id: number;
            price: number;
            quantity: number;
            menuItemId: number;
            orderId: number;
        }[];
        payments: {
            id: number;
            date: Date;
            paymentMethod: string;
            amount: number;
            reference: string | null;
            orderId: number;
        }[];
        id: number;
        status: string;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
        paidAmount: number;
        balanceAmount: number;
    }>;
    findAll(): Promise<{
        dailyOrderNumber: number;
        items: ({
            menuItem: {
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
            };
        } & {
            id: number;
            price: number;
            quantity: number;
            menuItemId: number;
            orderId: number;
        })[];
        payments: {
            id: number;
            date: Date;
            paymentMethod: string;
            amount: number;
            reference: string | null;
            orderId: number;
        }[];
        id: number;
        status: string;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
        paidAmount: number;
        balanceAmount: number;
    }[]>;
    findOne(id: number): Promise<{
        dailyOrderNumber: number;
        items: ({
            menuItem: {
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
            };
        } & {
            id: number;
            price: number;
            quantity: number;
            menuItemId: number;
            orderId: number;
        })[];
        payments: {
            id: number;
            date: Date;
            paymentMethod: string;
            amount: number;
            reference: string | null;
            orderId: number;
        }[];
        id: number;
        status: string;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
        paidAmount: number;
        balanceAmount: number;
    } | null>;
    update(id: number, data: any): import("@prisma/client").Prisma.Prisma__OrderClient<{
        items: {
            id: number;
            price: number;
            quantity: number;
            menuItemId: number;
            orderId: number;
        }[];
        payments: {
            id: number;
            date: Date;
            paymentMethod: string;
            amount: number;
            reference: string | null;
            orderId: number;
        }[];
    } & {
        id: number;
        status: string;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
        paidAmount: number;
        balanceAmount: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__OrderClient<{
        id: number;
        status: string;
        tax: number;
        date: Date;
        paymentMethod: string;
        subtotal: number;
        total: number;
        paidAmount: number;
        balanceAmount: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    addPayment(orderId: number, paymentDto: {
        amount: number;
        paymentMethod: string;
        reference?: string;
    }): Promise<{
        payment: {
            id: number;
            date: Date;
            paymentMethod: string;
            amount: number;
            reference: string | null;
            orderId: number;
        };
        order: {
            items: {
                id: number;
                price: number;
                quantity: number;
                menuItemId: number;
                orderId: number;
            }[];
            payments: {
                id: number;
                date: Date;
                paymentMethod: string;
                amount: number;
                reference: string | null;
                orderId: number;
            }[];
        } & {
            id: number;
            status: string;
            tax: number;
            date: Date;
            paymentMethod: string;
            subtotal: number;
            total: number;
            paidAmount: number;
            balanceAmount: number;
        };
        orderSummary: {
            total: number;
            paidAmount: number;
            balanceAmount: number;
            status: string;
        };
    }>;
    getPayments(orderId: number): Promise<{
        orderId: number;
        total: number;
        paidAmount: number;
        balanceAmount: number;
        status: string;
        payments: {
            id: number;
            date: Date;
            paymentMethod: string;
            amount: number;
            reference: string | null;
            orderId: number;
        }[];
    }>;
    removePayment(orderId: number, paymentId: number): Promise<{
        success: boolean;
        message: string;
        orderSummary: {
            total: number;
            paidAmount: number;
            balanceAmount: number;
            status: string;
        };
    }>;
}
