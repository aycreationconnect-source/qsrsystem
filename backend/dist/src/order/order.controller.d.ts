import { OrderService } from './order.service';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(createOrderDto: any): Promise<{
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
    findOne(id: string): Promise<{
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
    update(id: string, updateOrderDto: any): import("@prisma/client").Prisma.Prisma__OrderClient<{
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
    remove(id: string): import("@prisma/client").Prisma.Prisma__OrderClient<{
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
    addPayment(id: string, paymentDto: {
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
    getPayments(id: string): Promise<{
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
    removePayment(id: string, paymentId: string): Promise<{
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
