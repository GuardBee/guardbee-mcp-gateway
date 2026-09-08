import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GatewayConfig } from "../config";
/**
 * Minimal DB adapter — Prisma veya raw pg ile değiştirilebilir.
 * Şimdilik basit JSON sorgu arayüzü kullanıyor.
 */
type DbAdapter = {
    query(table: string, filter: Record<string, unknown>, limit: number): Promise<Record<string, unknown>[]>;
    tables(): Promise<string[]>;
};
export declare function registerDbTools(server: McpServer, config: GatewayConfig, db: DbAdapter): void;
export {};
//# sourceMappingURL=db-tools.d.ts.map