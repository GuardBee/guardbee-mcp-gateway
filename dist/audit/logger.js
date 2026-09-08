"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
exports.createAuditEvent = createAuditEvent;
const fs_1 = require("fs");
function generateId() {
    return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function createAuditEvent(partial) {
    return {
        id: generateId(),
        timestamp: new Date().toISOString(),
        ...partial,
    };
}
class AuditLogger {
    constructor(config) {
        this.config = config;
    }
    async log(event) {
        if (!this.config.enabled)
            return;
        const line = JSON.stringify(event);
        switch (this.config.sink) {
            case "console":
                console.error(`[AUDIT] ${line}`);
                break;
            case "file":
                if (!this.config.filePath) {
                    console.error("[guardbee-gateway] audit.filePath not set, falling back to console");
                    console.error(`[AUDIT] ${line}`);
                    break;
                }
                (0, fs_1.appendFileSync)(this.config.filePath, line + "\n", "utf8");
                break;
            case "http":
                if (!this.config.webhookUrl) {
                    console.error("[guardbee-gateway] audit.webhookUrl not set");
                    break;
                }
                try {
                    await fetch(this.config.webhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: line,
                    });
                }
                catch (err) {
                    console.error("[guardbee-gateway] audit webhook failed:", err);
                }
                break;
        }
    }
}
exports.AuditLogger = AuditLogger;
//# sourceMappingURL=logger.js.map