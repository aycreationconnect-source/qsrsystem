import { AddonService } from './addon.service';
export declare class AddonController {
    private readonly addonService;
    constructor(addonService: AddonService);
    create(body: any): Promise<{
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
    update(id: string, body: any): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: number;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        description: string | null;
        price: number;
    }>;
}
