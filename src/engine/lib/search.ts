import { db } from "../app";
import { Characters, Illustrations, Objects, Specys } from "../schema/database";

export type FieldType = "string&array" | "number" | "color";
export type ContentType = "character" | "object" | "illustration" | "specy";

export interface StringArrayFilter {
    mode: "equal" | "include";
    value: string;
}
export interface NumberFilter {
    mode: "inRange" | "closet";
    pattern?: { a: number; b: number };
}
export interface ColorFilter {
    target: string;
    allowOffset: string;
}
export interface FieldFilter {
    key: string | null;
    "string&array"?: StringArrayFilter;
    number?: NumberFilter;
    color?: ColorFilter;
}
export interface EqualCondition {
    type: "equal";
    filter: FieldFilter;
    fieldType: FieldType[];
}
export interface ComposeCondition {
    type: "compose";
    composeType: "and" | "or";
    filters: AnyCondition[];
    fieldType: FieldType[];
}
export type AnyCondition = EqualCondition | ComposeCondition;

function getByPath(row: Record<string, unknown>, key: string): unknown {
    return key.split(".").reduce<unknown>((o, k) => {
        if (o == null || typeof o !== "object") return undefined;
        return (o as Record<string, unknown>)[k];
    }, row);
}

function parseColor(input: string): { r: number; g: number; b: number } | null {
    const hex = /^#?([0-9a-f]{6})$/i.exec(input.trim());
    if (hex) {
        const n = parseInt(hex[1]!, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    const rgb = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(input.trim());
    if (rgb) {
        return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
    }
    return null;
}

function rgbToLab({ r, g, b }: { r: number; g: number; b: number }) {
    const linear = (v: number) => {
        v /= 255;
        return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
    };
    const R = linear(r);
    const G = linear(g);
    const B = linear(b);
    let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    let Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    let Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const gamma = (v: number) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
    X = gamma(X);
    Y = gamma(Y);
    Z = gamma(Z);
    return { L: 116 * Y - 16, a: 500 * (X - Y), b: 200 * (Y - Z) };
}

function deltaE(
    lhs: { L: number; a: number; b: number },
    rhs: { L: number; a: number; b: number },
): number {
    return Math.sqrt((lhs.L - rhs.L) ** 2 + (lhs.a - rhs.a) ** 2 + (lhs.b - rhs.b) ** 2);
}

function isStringArray(value: unknown, f: StringArrayFilter): boolean {
    if (typeof value === "string") {
        return f.mode === "equal" ? value === f.value : value.includes(f.value);
    }
    if (Array.isArray(value)) {
        return value.some((item) => isStringArray(item, f));
    }
    return false;
}

function isNumber(value: unknown, f: NumberFilter): boolean {
    if (typeof value === "number" && f.pattern) {
        const { a, b } = f.pattern;
        return f.mode === "inRange" ? a <= value && value <= b : Math.abs(value - a) <= b;
    }
    if (Array.isArray(value)) {
        return value.some((item) => isNumber(item, f));
    }
    return false;
}

function isColor(value: unknown, f: ColorFilter): boolean {
    if (Array.isArray(value)) {
        return value.some((item) => isColor(item, f));
    }
    if (!value || typeof value !== "object") return false;
    const { r, g, b } = value as { r: number; g: number; b: number };
    if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number") return false;
    const target = parseColor(f.target);
    if (!target) return false;
    const offset = Number(f.allowOffset);
    if (Number.isNaN(offset)) return false;
    return deltaE(rgbToLab({ r, g, b }), rgbToLab(target)) <= offset;
}

/**
 * 遍历行对象的所有字段（含嵌套），收集指定 fieldType 的字段值。
 */
function collectFields(
    row: unknown,
    fieldTypes: FieldType[],
    out: unknown[],
    visited = new Set<unknown>(),
): void {
    if (row == null || typeof row !== "object" || visited.has(row)) return;
    visited.add(row);
    if (Array.isArray(row)) {
        for (const item of row) collectFields(item, fieldTypes, out, visited);
        return;
    }
    for (const value of Object.values(row as Record<string, unknown>)) {
        if (Array.isArray(value) || (value != null && typeof value === "object")) {
            collectFields(value, fieldTypes, out, visited);
        } else {
            for (const fieldType of fieldTypes) {
                if (fieldType === "string&array" && typeof value === "string") out.push(value);
                else if (fieldType === "number" && typeof value === "number") out.push(value);
            }
        }
    }
}

function matchField(
    row: Record<string, unknown>,
    filter: FieldFilter,
    fieldTypes: FieldType[],
): boolean {
    if (filter.key == null) {
        const values: unknown[] = [];
        collectFields(row, fieldTypes, values);
        const sa = filter["string&array"];
        if (sa) return values.some((v) => isStringArray(v, sa));
        const num = filter.number;
        if (num) return values.some((v) => isNumber(v, num));
        const col = filter.color;
        if (col) return values.some((v) => isColor(v, col));
        return false;
    }
    const value = getByPath(row, filter.key);
    const sa = filter["string&array"];
    if (sa) return isStringArray(value, sa);
    const num = filter.number;
    if (num) return isNumber(value, num);
    const col = filter.color;
    if (col) return isColor(value, col);
    return false;
}

function evalCondition(row: Record<string, unknown>, cond: AnyCondition): boolean {
    if (cond.type === "equal") return matchField(row, cond.filter, cond.fieldType);
    const results = cond.filters.map((c) => evalCondition(row, c));
    return cond.composeType === "and" ? results.every(Boolean) : results.some(Boolean);
}

export async function searchContent(
    type: ContentType,
    condition: AnyCondition,
): Promise<unknown[]> {
    const table =
        type === "character"
            ? Characters
            : type === "object"
              ? Objects
              : type === "illustration"
                ? Illustrations
                : Specys;
    const rows = await db.select().from(table);
    return rows.filter((row) => evalCondition(row as Record<string, unknown>, condition));
}
