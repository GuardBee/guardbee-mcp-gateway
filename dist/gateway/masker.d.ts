import type { FieldRule, MaskingStrategy } from "../config";
/**
 * Tek bir değeri maskeleme stratejisine göre dönüştürür.
 */
export declare function applyStrategy(value: unknown, strategy: MaskingStrategy): unknown;
/**
 * Bir row objesini verilen field kurallarına göre maskeler.
 * İç içe objeler için recursive çalışır.
 */
export declare function maskRow(row: Record<string, unknown>, fieldRules: FieldRule[], tableName?: string): Record<string, unknown>;
/**
 * Row listesini maskeler ve maxRows sınırını uygular.
 */
export declare function maskRows(rows: Record<string, unknown>[], fieldRules: FieldRule[], tableName: string, maxRows: number): {
    rows: Record<string, unknown>[];
    truncated: boolean;
};
//# sourceMappingURL=masker.d.ts.map