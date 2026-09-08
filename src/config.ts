import { z } from "zod";

/**
 * Per-field masking rule.
 * - "redact"  → field tamamen silinir
 * - "mask"    → değerin ortası yıldızlanır  (ahm***ar@example.com)
 * - "hash"    → SHA-256 ile hash'lenir (analiz için tekrar tanınabilir)
 * - "allow"   → olduğu gibi geçer (whitelist)
 */
export const MaskingStrategySchema = z.enum(["redact", "mask", "hash", "allow"]);
export type MaskingStrategy = z.infer<typeof MaskingStrategySchema>;

export const FieldRuleSchema = z.object({
  /** Exact field name or glob pattern, e.g. "*Password*", "tc_kimlik" */
  field: z.string(),
  strategy: MaskingStrategySchema,
  /** Optional: only apply when table matches */
  table: z.string().optional(),
});
export type FieldRule = z.infer<typeof FieldRuleSchema>;

export const TableRuleSchema = z.object({
  table: z.string(),
  /** "deny" = bu tablodan hiç veri geçmez */
  access: z.enum(["allow", "deny"]),
  /** Max row count LLM'e döndürülebilir */
  maxRows: z.number().int().positive().optional(),
});
export type TableRule = z.infer<typeof TableRuleSchema>;

export const AuditConfigSchema = z.object({
  enabled: z.boolean().default(true),
  /** "console" | "file" | "http" */
  sink: z.enum(["console", "file", "http"]).default("console"),
  /** file sink için log dosyası yolu */
  filePath: z.string().optional(),
  /** http sink için webhook URL */
  webhookUrl: z.string().url().optional(),
});
export type AuditConfig = z.infer<typeof AuditConfigSchema>;

export const GatewayConfigSchema = z.object({
  /** Database connection URL — müşterinin kendi DB'si. Demo adapter kullanılıyorsa boş bırakılabilir. */
  databaseUrl: z.string().optional(),

  /**
   * KVKK / GDPR kuralları için otomatik field maskeleme.
   * Sıra önemli: ilk eşleşen kural uygulanır.
   */
  fieldRules: z.array(FieldRuleSchema).default([
    // Türkiye — KVKK özel kategoriler
    { field: "tcKimlik",       strategy: "redact" },
    { field: "tc_kimlik",      strategy: "redact" },
    { field: "nationalId",     strategy: "redact" },
    { field: "iban",           strategy: "mask" },
    { field: "IBAN",           strategy: "mask" },
    // Genel PII
    { field: "email",          strategy: "mask" },
    { field: "phone",          strategy: "mask" },
    { field: "phoneNumber",    strategy: "mask" },
    { field: "mobile",         strategy: "mask" },
    { field: "address",        strategy: "mask" },
    { field: "birthDate",      strategy: "redact" },
    { field: "dateOfBirth",    strategy: "redact" },
    // Credentials
    { field: "password",       strategy: "redact" },
    { field: "passwordHash",   strategy: "redact" },
    { field: "hashedPassword", strategy: "redact" },
    { field: "refreshToken",   strategy: "redact" },
    { field: "accessToken",    strategy: "redact" },
    { field: "apiKey",         strategy: "redact" },
    { field: "secretKey",      strategy: "redact" },
    { field: "privateKey",     strategy: "redact" },
  ]),

  /** Tablo bazlı erişim kuralları */
  tableRules: z.array(TableRuleSchema).default([]),

  /** Varsayılan max satır sayısı (tablo kuralı yoksa) */
  defaultMaxRows: z.number().int().positive().default(50),

  /** Audit log ayarları */
  audit: AuditConfigSchema.default(() => ({ enabled: true, sink: "console" as const })),

  /** MCP server adı */
  serverName: z.string().default("guardbee-db-gateway"),
});

export type GatewayConfig = z.infer<typeof GatewayConfigSchema>;

/** Config'i env'den veya doğrudan obje olarak yükle */
export function loadConfig(overrides?: Partial<GatewayConfig>): GatewayConfig {
  const raw = {
    databaseUrl: process.env.DATABASE_URL ?? "",
    serverName: process.env.GATEWAY_SERVER_NAME,
    ...overrides,
  };
  return GatewayConfigSchema.parse(raw);
}
