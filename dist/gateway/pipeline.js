"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayPipeline = void 0;
const masker_1 = require("./masker");
const logger_1 = require("../audit/logger");
class GatewayPipeline {
    constructor(config) {
        this.config = config;
        this.audit = new logger_1.AuditLogger(config.audit);
    }
    /**
     * Veriyi gateway üzerinden geçirir:
     *   1. Tablo erişim kontrolü
     *   2. PII / field maskeleme
     *   3. Row sayısı limiti
     *   4. Audit log
     */
    async process(tool, table, params, rawRows) {
        const started = Date.now();
        // 1. Tablo erişim kontrolü
        const tableRule = this.config.tableRules.find((r) => r.table === table);
        if (tableRule?.access === "deny") {
            const auditId = await this.logDenied(tool, table, params, started, "Table access denied by policy");
            return { denied: true, reason: `Access to table '${table}' is denied by gateway policy.`, auditId };
        }
        // 2. Maskeleme + row limiti
        const maxRows = tableRule?.maxRows ?? this.config.defaultMaxRows;
        const { rows, truncated } = (0, masker_1.maskRows)(rawRows, this.config.fieldRules, table, maxRows);
        // 3. Hangi field'lar maskelendi?
        const redactedFields = this.detectRedactedFields(rawRows[0] ?? {}, rows[0] ?? {});
        // 4. Audit log
        const event = (0, logger_1.createAuditEvent)({
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
    detectRedactedFields(original, masked) {
        return Object.keys(original).filter((k) => original[k] !== masked[k]);
    }
    async logDenied(tool, table, params, started, reason) {
        const event = (0, logger_1.createAuditEvent)({
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
exports.GatewayPipeline = GatewayPipeline;
//# sourceMappingURL=pipeline.js.map