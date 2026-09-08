import type { GatewayConfig } from "../config";
import { maskRows } from "./masker";
import { AuditLogger, createAuditEvent } from "../audit/logger";

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

export class GatewayPipeline {
  private readonly audit: AuditLogger;

  constructor(private readonly config: GatewayConfig) {
    this.audit = new AuditLogger(config.audit);
  }

  /**
   * Veriyi gateway üzerinden geçirir:
   *   1. Tablo erişim kontrolü
   *   2. PII / field maskeleme
   *   3. Row sayısı limiti
   *   4. Audit log
   */
  async process(
    tool: string,
    table: string,
    params: Record<string, unknown>,
    rawRows: Record<string, unknown>[]
  ): Promise<QueryResult | DeniedResult> {
    const started = Date.now();

    // 1. Tablo erişim kontrolü
    const tableRule = this.config.tableRules.find((r) => r.table === table);
    if (tableRule?.access === "deny") {
      const auditId = await this.logDenied(tool, table, params, started, "Table access denied by policy");
      return { denied: true, reason: `Access to table '${table}' is denied by gateway policy.`, auditId };
    }

    // 2. Maskeleme + row limiti
    const maxRows = tableRule?.maxRows ?? this.config.defaultMaxRows;
    const { rows, truncated } = maskRows(
      rawRows,
      this.config.fieldRules,
      table,
      maxRows
    );

    // 3. Hangi field'lar maskelendi?
    const redactedFields = this.detectRedactedFields(rawRows[0] ?? {}, rows[0] ?? {});

    // 4. Audit log
    const event = createAuditEvent({
      tool,
      table,
      params,
      rowsReturned: rows.length,
      truncated,
      fieldsRedacted: redactedFields,
      durationMs: Date.now() - started,
    });
    await this.audit.log(event);

    return {
      rows,
      truncated,
      totalBeforeTruncation: rawRows.length,
      auditId: event.id,
    };
  }

  private detectRedactedFields(
    original: Record<string, unknown>,
    masked: Record<string, unknown>
  ): string[] {
    return Object.keys(original).filter(
      (k) => original[k] !== masked[k]
    );
  }

  private async logDenied(
    tool: string,
    table: string,
    params: Record<string, unknown>,
    started: number,
    reason: string
  ): Promise<string> {
    const event = createAuditEvent({
      tool,
      table,
      params,
      rowsReturned: 0,
      truncated: false,
      fieldsRedacted: [],
      durationMs: Date.now() - started,
      denied: true,
      denyReason: reason,
    });
    await this.audit.log(event);
    return event.id;
  }
}
