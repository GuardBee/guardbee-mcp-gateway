import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type GatewayConfig } from "./config";
/**
 * Basit in-memory DB adapter — gerçek kullanımda Prisma veya pg ile değiştirilir.
 * createServer() fonksiyonunun ikinci parametresi olarak geçilir.
 */
type DbAdapter = {
    query(table: string, filter: Record<string, unknown>, limit: number): Promise<Record<string, unknown>[]>;
    tables(): Promise<string[]>;
};
export declare function createServer(configOverrides?: Partial<GatewayConfig>, dbAdapter?: DbAdapter): McpServer;
export declare function startStdioServer(configOverrides?: Partial<GatewayConfig>, dbAdapter?: DbAdapter): Promise<void>;
export {};
//# sourceMappingURL=server.d.ts.map