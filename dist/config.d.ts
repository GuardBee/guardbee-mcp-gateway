import { z } from "zod";
/**
 * Per-field masking rule.
 * - "redact"  → field tamamen silinir
 * - "mask"    → değerin ortası yıldızlanır  (ahm***ar@example.com)
 * - "hash"    → SHA-256 ile hash'lenir (analiz için tekrar tanınabilir)
 * - "allow"   → olduğu gibi geçer (whitelist)
 */
export declare const MaskingStrategySchema: z.ZodEnum<{
    allow: "allow";
    hash: "hash";
    mask: "mask";
    redact: "redact";
}>;
export type MaskingStrategy = z.infer<typeof MaskingStrategySchema>;
export declare const FieldRuleSchema: z.ZodObject<{
    field: z.ZodString;
    strategy: z.ZodEnum<{
        allow: "allow";
        hash: "hash";
        mask: "mask";
        redact: "redact";
    }>;
    table: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type FieldRule = z.infer<typeof FieldRuleSchema>;
export declare const TableRuleSchema: z.ZodObject<{
    table: z.ZodString;
    access: z.ZodEnum<{
        allow: "allow";
        deny: "deny";
    }>;
    maxRows: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type TableRule = z.infer<typeof TableRuleSchema>;
export declare const AuditConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    sink: z.ZodDefault<z.ZodEnum<{
        console: "console";
        file: "file";
        http: "http";
    }>>;
    filePath: z.ZodOptional<z.ZodString>;
    webhookUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AuditConfig = z.infer<typeof AuditConfigSchema>;
export declare const GatewayConfigSchema: z.ZodObject<{
    databaseUrl: z.ZodOptional<z.ZodString>;
    fieldRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        strategy: z.ZodEnum<{
            allow: "allow";
            hash: "hash";
            mask: "mask";
            redact: "redact";
        }>;
        table: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    tableRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        table: z.ZodString;
        access: z.ZodEnum<{
            allow: "allow";
            deny: "deny";
        }>;
        maxRows: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    defaultMaxRows: z.ZodDefault<z.ZodNumber>;
    audit: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        sink: z.ZodDefault<z.ZodEnum<{
            console: "console";
            file: "file";
            http: "http";
        }>>;
        filePath: z.ZodOptional<z.ZodString>;
        webhookUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    serverName: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type GatewayConfig = z.infer<typeof GatewayConfigSchema>;
/** Config'i env'den veya doğrudan obje olarak yükle */
export declare function loadConfig(overrides?: Partial<GatewayConfig>): GatewayConfig;
//# sourceMappingURL=config.d.ts.map