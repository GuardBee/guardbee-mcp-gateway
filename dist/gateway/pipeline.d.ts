import type { GatewayConfig } from "../config";
export type QueryResult = {
    rows: Record<string, unknown>[];
    truncated: boolean;
    totalBeforeTruncation: number;
    auditId: string;
};
export type DeniedResult = {
    denied: true;
    reason: string;
    auditId: string;
};
export declare class GatewayPipeline {
    private readonly config;
    private readonly audit;
    constructor(config: GatewayConfig);
    /**
     * Veriyi gateway üzerinden geçirir:
     *   1. Tablo erişim kontrolü
     *   2. PII / field maskeleme
     *   3. Row sayısı limiti
     *   4. Audit log
     */
    process(tool: string, table: string, params: Record<string, unknown>, rawRows: Record<string, unknown>[]): Promise<QueryResult | DeniedResult>;
    private detectRedactedFields;
    private logDenied;
}
//# sourceMappingURL=pipeline.d.ts.map