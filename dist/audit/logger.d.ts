import type { AuditConfig } from "../config";
export type AuditEvent = {
    id: string;
    timestamp: string;
    tool: string;
    table: string;
    params: Record<string, unknown>;
    rowsReturned: number;
    truncated: boolean;
    fieldsRedacted: string[];
    durationMs: number;
    denied?: boolean;
    denyReason?: string;
};
export declare function createAuditEvent(partial: Omit<AuditEvent, "id" | "timestamp">): AuditEvent;
export declare class AuditLogger {
    private readonly config;
    constructor(config: AuditConfig);
    log(event: AuditEvent): Promise<void>;
}
//# sourceMappingURL=logger.d.ts.map