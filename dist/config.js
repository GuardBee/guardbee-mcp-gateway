"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayConfigSchema = exports.AuditConfigSchema = exports.TableRuleSchema = exports.FieldRuleSchema = exports.MaskingStrategySchema = void 0;
exports.loadConfig = loadConfig;
const zod_1 = require("zod");
/**
 * Per-field masking rule.
 * - "redact"  → field tamamen silinir
 * - "mask"    → değerin ortası yıldızlanır  (ahm***ar@example.com)
 * - "hash"    → SHA-256 ile hash'lenir (analiz için tekrar tanınabilir)
 * - "allow"   → olduğu gibi geçer (whitelist)
 */
exports.MaskingStrategySchema = zod_1.z.enum(["redact", "mask", "hash", "allow"]);
exports.FieldRuleSchema = zod_1.z.object({
    /** Exact field name or glob pattern, e.g. "*Password*", "tc_kimlik" */
    field: zod_1.z.string(),
    strategy: exports.MaskingStrategySchema,
    /** Optional: only apply when table matches */
    table: zod_1.z.string().optional(),
});
exports.TableRuleSchema = zod_1.z.object({
    table: zod_1.z.string(),
    /** "deny" = bu tablodan hiç veri geçmez */
    access: zod_1.z.enum(["allow", "deny"]),
    /** Max row count LLM'e döndürülebilir */
    maxRows: zod_1.z.number().int().positive().optional(),
});
exports.AuditConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    /** "console" | "file" | "http" */
    sink: zod_1.z.enum(["console", "file", "http"]).default("console"),
    /** file sink için log dosyası yolu */
    filePath: zod_1.z.string().optional(),
    /** http sink için webhook URL */
    webhookUrl: zod_1.z.string().url().optional(),
});
exports.GatewayConfigSchema = zod_1.z.object({
    /** Database connection URL — müşterinin kendi DB'si. Demo adapter kullanılıyorsa boş bırakılabilir. */
    databaseUrl: zod_1.z.string().optional(),
    /**
     * KVKK / GDPR kuralları için otomatik field maskeleme.
     * Sıra önemli: ilk eşleşen kural uygulanır.
     */
    fieldRules: zod_1.z.array(exports.FieldRuleSchema).default([
        // Türkiye — KVKK özel kategoriler
        { field: "tcKimlik", strategy: "redact" },
        { field: "tc_kimlik", strategy: "redact" },
        { field: "nationalId", strategy: "redact" },
        { field: "iban", strategy: "mask" },
        { field: "IBAN", strategy: "mask" },
        // Genel PII
        { field: "email", strategy: "mask" },
        { field: "phone", strategy: "mask" },
        { field: "phoneNumber", strategy: "mask" },
        { field: "mobile", strategy: "mask" },
        { field: "address", strategy: "mask" },
        { field: "birthDate", strategy: "redact" },
        { field: "dateOfBirth", strategy: "redact" },
        // Credentials
        { field: "password", strategy: "redact" },
        { field: "passwordHash", strategy: "redact" },
        { field: "hashedPassword", strategy: "redact" },
        { field: "refreshToken", strategy: "redact" },
        { field: "accessToken", strategy: "redact" },
        { field: "apiKey", strategy: "redact" },
        { field: "secretKey", strategy: "redact" },
        { field: "privateKey", strategy: "redact" },
    ]),
    /** Tablo bazlı erişim kuralları */
    tableRules: zod_1.z.array(exports.TableRuleSchema).default([]),
    /** Varsayılan max satır sayısı (tablo kuralı yoksa) */
    defaultMaxRows: zod_1.z.number().int().positive().default(50),
    /** Audit log ayarları */
    audit: exports.AuditConfigSchema.default(() => ({ enabled: true, sink: "console" })),
    /** MCP server adı */
    serverName: zod_1.z.string().default("guardbee-db-gateway"),
});
/** Config'i env'den veya doğrudan obje olarak yükle */
function loadConfig(overrides) {
    const raw = {
        databaseUrl: process.env.DATABASE_URL ?? "",
        serverName: process.env.GATEWAY_SERVER_NAME,
        ...overrides,
    };
    return exports.GatewayConfigSchema.parse(raw);
}
//# sourceMappingURL=config.js.map