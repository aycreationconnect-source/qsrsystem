import { AddonService } from './addon.service';
export declare class AddonController {
    private readonly addonService;
    constructor(addonService: AddonService);
    create(body: any): Promise<{
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
    update(id: string, body: any): Promise<{
        name: string;
        description: string | null;
        id: number;
        price: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        description: string | null;
        id: number;
        price: number;
    }>;
}
