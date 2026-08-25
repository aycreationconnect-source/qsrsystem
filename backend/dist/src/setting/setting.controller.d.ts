import { PrismaService } from '../prisma/prisma.service';
export declare class SettingController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{}>;
    saveSettings(body: Record<string, string>): Promise<{
        success: boolean;
    }>;
}
