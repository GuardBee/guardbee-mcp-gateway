"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStrategy = applyStrategy;
exports.maskRow = maskRow;
exports.maskRows = maskRows;
const crypto_1 = require("crypto");
/**
 * Tek bir değeri maskeleme stratejisine göre dönüştürür.
 */
function applyStrategy(value, strategy) {
    if (value === null || value === undefined)
        return value;
    switch (strategy) {
        case "redact":
            return "[REDACTED]";
        case "mask":
            return maskValue(value);
        case "hash":
            return (0, crypto_1.createHash)("sha256")
                .update(String(value))
                .digest("hex")
                .slice(0, 16);
        case "allow":
            return value;
    }
}
/**
 * String değerlerin ortasını yıldızlar:
 *   "ahmet@example.com"  → "ah***@example.com"
 *   "5301234567"         → "530***4567"
 *   "TR12 0001 0017..."  → "TR12***..."
 */
function maskValue(value) {
    const str = String(value);
    // E-posta
    if (str.includes("@")) {
        const [local, domain] = str.split("@");
        const visible = local.slice(0, Math.min(2, local.length));
        return `${visible}***@${domain}`;
    }
    // Sadece rakamlar (telefon, TC kimlik, IBAN sayısal kısmı)
    if (/^\+?[\d\s\-()]+$/.test(str)) {
        const digits = str.replace(/\D/g, "");
        if (digits.length <= 4)
            return "****";
        return digits.slice(0, 3) + "***" + digits.slice(-2);
    }
    // Genel string
    if (str.length <= 4)
        return "****";
    const show = Math.max(1, Math.floor(str.length * 0.2));
    return str.slice(0, show) + "***" + str.slice(-show);
}
/**
 * Glob benzeri pattern eşleştirme:
 *   "*Password*"  → passwordHash, userPassword, ...
 *   "email"       → tam eşleşme
 */
function matchesPattern(fieldName, pattern) {
    if (!pattern.includes("*"))
        return fieldName === pattern;
    const regexStr = pattern
        .split("*")
        .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*");
    return new RegExp(`^${regexStr}$`, "i").test(fieldName);
}
/**
 * Bir row objesini verilen field kurallarına göre maskeler.
 * İç içe objeler için recursive çalışır.
 */
function maskRow(row, fieldRules, tableName) {
    const result = {};
    for (const [key, value] of Object.entries(row)) {
        const rule = fieldRules.find((r) => matchesPattern(key, r.field) &&
            (!r.table || r.table === tableName));
        if (rule) {
            result[key] = applyStrategy(value, rule.strategy);
        }
        else if (value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)) {
            // İç içe obje: recursive maskele
            result[key] = maskRow(value, fieldRules, tableName);
        }
        else if (Array.isArray(value)) {
            // Array içindeki objeler
            result[key] = value.map((item) => item && typeof item === "object"
                ? maskRow(item, fieldRules, tableName)
                : item);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Row listesini maskeler ve maxRows sınırını uygular.
 */
function maskRows(rows, fieldRules, tableName, maxRows) {
    const truncated = rows.length > maxRows;
    const limited = truncated ? rows.slice(0, maxRows) : rows;
    return {
        rows: limited.map((row) => maskRow(row, fieldRules, tableName)),
        truncated,
    };
}
//# sourceMappingURL=masker.js.map