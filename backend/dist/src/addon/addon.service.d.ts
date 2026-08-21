import { PrismaService } from '../prisma/prisma.service';
export declare class AddonService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        name: string;
        description: string | null;
        id: number;
        price: number;
    }>;
    findAll(): Promise<{
        name: string;
        description: string | null;
        id: number;
        price: number;
    }[]>;
    update(id: number, data: any): Promise<{
        name: string;
        description: string | null;
        id: number;
        price: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        description: string | null;
        id: number;
        price: number;
    }>;
}
