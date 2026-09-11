export type DomainResult = { name: string; available: boolean; price?: number; currency: "VND" };
export interface DomainProvider { search(baseName: string, tlds: string[]): Promise<DomainResult[]>; }

const MOCK_PRICES: Record<string, number> = { ".vn": 490000, ".com": 320000, ".com.vn": 280000, ".co": 750000, ".shop": 650000 };

export const mockDomainProvider: DomainProvider = {
  async search(baseName, tlds) {
    return tlds.map((tld, index) => ({ name: `${baseName}${tld}`, available: index !== 3, price: index === 3 ? undefined : MOCK_PRICES[tld] ?? 400000, currency: "VND" as const }));
  },
};

export function getDomainProvider(): DomainProvider { return mockDomainProvider; }
