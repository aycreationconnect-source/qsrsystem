import { PrismaService } from '../prisma/prisma.service';
export declare class AddonService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: number;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: number;
    }[]>;
    update(id: number, data: any): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: number;
    }>;
}
