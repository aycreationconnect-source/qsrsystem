import { PrismaService } from '../prisma/prisma.service';
export declare class SettingController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{}>;
    saveSettings(body: Record<string, string>): Promise<{
        success: boolean;
    }>;
    getStoreProfile(): Promise<{
        id: string;
        cafeCode: string;
        businessName: string;
        ownerName: string;
        phone: string;
        email: string | null;
        city: string;
        state: string;
        address: string | null;
        gstin: string | null;
        currencySymbol: string;
        receiptFooter: string | null;
        logoUrl: string | null;
        isActivated: boolean;
        activatedAt: Date | null;
        updatedAt: Date;
    } | null>;
    updateStoreProfile(body: any): Promise<{
        success: boolean;
        message: string;
        store?: undefined;
    } | {
        success: boolean;
        store: {
            id: string;
            cafeCode: string;
            businessName: string;
            ownerName: string;
            phone: string;
            email: string | null;
            city: string;
            state: string;
            address: string | null;
            gstin: string | null;
            currencySymbol: string;
            receiptFooter: string | null;
            logoUrl: string | null;
            isActivated: boolean;
            activatedAt: Date | null;
            updatedAt: Date;
        };
        message?: undefined;
    }>;
}
