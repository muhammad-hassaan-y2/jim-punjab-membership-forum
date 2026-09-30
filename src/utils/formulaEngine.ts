/**
 * Comprehensive Excel Formula Engine for Financial Spreadsheet
 * Supports math operators, cell references (A1, K2:V2), and common Excel functions:
 * SUM, AVERAGE, COUNT, COUNTA, MIN, MAX, PRODUCT, ABS, ROUND, ROUNDUP, ROUNDDOWN,
 * MOD, POWER, SQRT, IF, AND, OR, NOT, CONCAT, TRIM, UPPER, LOWER, LEN, NOW, TODAY
 */

export interface FormulaDefinition {
  name: string;
  category: 'Math & Stats' | 'Logical' | 'Text' | 'Date & Time';
  syntax: string;
  description: string;
  example: string;
  template: string;
}

export const EXCEL_FORMULA_DOCS: FormulaDefinition[] = [
  {
    name: 'SUM',
    category: 'Math & Stats',
    syntax: 'SUM(number1, [number2], ...)',
    description: 'Adds all numbers or ranges of cells together.',
    example: '=SUM(K1:V1)',
    template: '=SUM(K{row}:V{row})',
  },
  {
    name: 'AVERAGE',
    category: 'Math & Stats',
    syntax: 'AVERAGE(number1, [number2], ...)',
    description: 'Calculates the arithmetic mean of numbers or ranges.',
    example: '=AVERAGE(K1:V1)',
    template: '=AVERAGE(K{row}:V{row})',
  },
  {
    name: 'COUNT',
    category: 'Math & Stats',
    syntax: 'COUNT(value1, [value2], ...)',
    description: 'Counts the number of cells that contain numbers.',
    example: '=COUNT(K1:V1)',
    template: '=COUNT(K{row}:V{row})',
  },
  {
    name: 'COUNTA',
    category: 'Math & Stats',
    syntax: 'COUNTA(value1, [value2], ...)',
    description: 'Counts the number of cells that are not empty.',
    example: '=COUNTA(A1:A20)',
    template: '=COUNTA(A1:A20)',
  },
  {
    name: 'MAX',
    category: 'Math & Stats',
    syntax: 'MAX(number1, [number2], ...)',
    description: 'Returns the largest value from a list of numbers or cells.',
    example: '=MAX(K1:V1)',
    template: '=MAX(K{row}:V{row})',
  },
  {
    name: 'MIN',
    category: 'Math & Stats',
    syntax: 'MIN(number1, [number2], ...)',
    description: 'Returns the smallest value from a list of numbers or cells.',
    example: '=MIN(K1:V1)',
    template: '=MIN(K{row}:V{row})',
  },
  {
    name: 'PRODUCT',
    category: 'Math & Stats',
    syntax: 'PRODUCT(number1, [number2], ...)',
    description: 'Multiplies all the numbers given as arguments.',
    example: '=PRODUCT(H1, 12)',
    template: '=PRODUCT(H{row}, 12)',
  },
  {
    name: 'ROUND',
    category: 'Math & Stats',
    syntax: 'ROUND(number, num_digits)',
    description: 'Rounds a number to a specified number of digits.',
    example: '=ROUND(AVERAGE(K1:V1), 2)',
    template: '=ROUND(AVERAGE(K{row}:V{row}), 2)',
  },
  {
    name: 'ROUNDUP',
    category: 'Math & Stats',
    syntax: 'ROUNDUP(number, num_digits)',
    description: 'Rounds a number up, away from zero.',
    example: '=ROUNDUP(12.345, 1)',
    template: '=ROUNDUP(W{row} / 12, 0)',
  },
  {
    name: 'ROUNDDOWN',
    category: 'Math & Stats',
    syntax: 'ROUNDDOWN(number, num_digits)',
    description: 'Rounds a number down, toward zero.',
    example: '=ROUNDDOWN(12.345, 1)',
    template: '=ROUNDDOWN(W{row} / 12, 0)',
  },
  {
    name: 'ABS',
    category: 'Math & Stats',
    syntax: 'ABS(number)',
    description: 'Returns the absolute (positive) value of a number.',
    example: '=ABS(Y1)',
    template: '=ABS(Y{row})',
  },
  {
    name: 'MOD',
    category: 'Math & Stats',
    syntax: 'MOD(number, divisor)',
    description: 'Returns the remainder after number is divided by divisor.',
    example: '=MOD(10, 3)',
    template: '=MOD(W{row}, 1000)',
  },
  {
    name: 'POWER',
    category: 'Math & Stats',
    syntax: 'POWER(number, power)',
    description: 'Returns the result of a number raised to a power.',
    example: '=POWER(10, 2)',
    template: '=POWER(H{row}, 2)',
  },
  {
    name: 'SQRT',
    category: 'Math & Stats',
    syntax: 'SQRT(number)',
    description: 'Returns the square root of a positive number.',
    example: '=SQRT(144)',
    template: '=SQRT(W{row})',
  },
  {
    name: 'IF',
    category: 'Logical',
    syntax: 'IF(logical_test, value_if_true, [value_if_false])',
    description: 'Checks whether condition is met; returns one value if TRUE, another if FALSE.',
    example: '=IF(Y1 > 0, "DUE", "PAID")',
    template: '=IF(Y{row} > 0, "DUE", "PAID")',
  },
  {
    name: 'AND',
    category: 'Logical',
    syntax: 'AND(logical1, [logical2], ...)',
    description: 'Returns TRUE if all its arguments evaluate to TRUE.',
    example: '=AND(W1 > 0, Y1 == 0)',
    template: '=AND(W{row} > 0, Y{row} == 0)',
  },
  {
    name: 'OR',
    category: 'Logical',
    syntax: 'OR(logical1, [logical2], ...)',
    description: 'Returns TRUE if any argument evaluates to TRUE.',
    example: '=OR(W1 > 0, H1 > 0)',
    template: '=OR(W{row} > 0, H{row} > 0)',
  },
  {
    name: 'NOT',
    category: 'Logical',
    syntax: 'NOT(logical)',
    description: 'Reverses the logic of its argument.',
    example: '=NOT(Y1 == 0)',
    template: '=NOT(Y{row} == 0)',
  },
  {
    name: 'CONCAT',
    category: 'Text',
    syntax: 'CONCAT(text1, [text2], ...)',
    description: 'Joins several text items into one text string.',
    example: '=CONCAT(A1, " - ", B1)',
    template: '=CONCAT(A{row}, " - ", B{row})',
  },
  {
    name: 'TRIM',
    category: 'Text',
    syntax: 'TRIM(text)',
    description: 'Removes all spaces from text except for single spaces between words.',
    example: '=TRIM(A1)',
    template: '=TRIM(A{row})',
  },
  {
    name: 'UPPER',
    category: 'Text',
    syntax: 'UPPER(text)',
    description: 'Converts a text string to all uppercase letters.',
    example: '=UPPER(A1)',
    template: '=UPPER(A{row})',
  },
  {
    name: 'LOWER',
    category: 'Text',
    syntax: 'LOWER(text)',
    description: 'Converts all letters in a text string to lowercase.',
    example: '=LOWER(A1)',
    template: '=LOWER(A{row})',
  },
  {
    name: 'LEN',
    category: 'Text',
    syntax: 'LEN(text)',
    description: 'Returns the number of characters in a text string.',
    example: '=LEN(A1)',
    template: '=LEN(A{row})',
  },
  {
    name: 'TODAY',
    category: 'Date & Time',
    syntax: 'TODAY()',
    description: 'Returns the current date formatted as YYYY-MM-DD.',
    example: '=TODAY()',
    template: '=TODAY()',
  },
  {
    name: 'NOW',
    category: 'Date & Time',
    syntax: 'NOW()',
    description: 'Returns the current date and time string.',
    example: '=NOW()',
    template: '=NOW()',
  },
];

/**
 * Checks if input is an Excel formula (begins with '=')
 */
export function isFormula(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  return val.trim().startsWith('=');
}

/**
 * Converts column letter(s) to 0-based column index:
 * 'A' -> 0, 'Z' -> 25, 'AA' -> 26, 'AB' -> 27
 */
export function colLetterToIndex(colStr: string): number {
  let index = 0;
  const upper = colStr.toUpperCase().trim();
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

/**
 * Converts 0-based index to column letter:
 * 0 -> 'A', 25 -> 'Z', 26 -> 'AA', 27 -> 'AB'
 */
export function indexToColLetter(index: number): string {
  let temp = index + 1;
  let letter = '';
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
}

/**
 * Parses cell reference string: 'A1', 'AB12', '$K$5'
 * Returns { colStr: string; rowNum: number } or null
 */
export function parseCellReference(cellRef: string): { colStr: string; rowNum: number } | null {
  const clean = cellRef.replace(/\$/g, '').trim().toUpperCase();
  const match = clean.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  return {
    colStr: match[1],
    rowNum: parseInt(match[2], 10),
  };
}

/**
 * Expands range reference like 'K1:V1' or 'A1:A5' into list of cell references
 */
export function expandCellRange(rangeStr: string): string[] {
  const parts = rangeStr.split(':');
  if (parts.length !== 2) return [rangeStr.trim()];

  const start = parseCellReference(parts[0]);
  const end = parseCellReference(parts[1]);
  if (!start || !end) return [];

  const startColIdx = colLetterToIndex(start.colStr);
  const endColIdx = colLetterToIndex(end.colStr);
  const startRow = Math.min(start.rowNum, end.rowNum);
  const endRow = Math.max(start.rowNum, end.rowNum);

  const minCol = Math.min(startColIdx, endColIdx);
  const maxCol = Math.max(startColIdx, endColIdx);

  const cells: string[] = [];
  for (let r = startRow; r <= endRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      cells.push(`${indexToColLetter(c)}${r}`);
    }
  }
  return cells;
}

export type CellValueGetter = (colStr: string, rowNum: number) => any;

/**
 * Evaluates an Excel formula string
 * Example: '=SUM(K1:V1)', '=AVERAGE(10, 20, 30)', '=H1 * 12', '=IF(Y1 > 0, "DUE", "PAID")'
 */
export function evaluateFormula(
  formula: string,
  getCellValue: CellValueGetter,
  currentContext?: { colStr?: string; rowNum?: number }
): { result: any; error?: string } {
  if (!isFormula(formula)) {
    return { result: formula };
  }

  const rawExpr = formula.trim().substring(1).trim();
  if (!rawExpr) {
    return { result: 0 };
  }

  try {
    // 1. Preprocess range functions: expand K1:V1 inside functions or operations
    let processed = rawExpr;

    // Helper to extract numeric/scalar value from a cell
    const fetchValue = (ref: string): any => {
      const parsed = parseCellReference(ref);
      if (!parsed) return 0;
      const val = getCellValue(parsed.colStr, parsed.rowNum);
      if (val === undefined || val === null || val === '') return 0;
      if (typeof val === 'number') return val;
      const num = Number(val);
      if (!isNaN(num)) return num;
      return String(val);
    };

    // Replace range references e.g. SUM(K1:V1) -> SUM([expanded values])
    processed = processed.replace(/([A-Z]+[0-9]+):([A-Z]+[0-9]+)/gi, (match) => {
      const cells = expandCellRange(match);
      const vals = cells.map(c => {
        const v = fetchValue(c);
        return typeof v === 'number' ? v : JSON.stringify(v);
      });
      return `[${vals.join(',')}]`;
    });

    // Replace individual cell references e.g. A1, H2, K1, AA4 (not followed by another letter/number)
    // Avoid replacing inside quotes
    processed = processed.replace(/\b([A-Z]+[0-9]+)\b(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/gi, (match) => {
      const v = fetchValue(match);
      return typeof v === 'number' ? String(v) : JSON.stringify(String(v));
    });

    // Replace Excel comparison '=' with '===' and '<>' with '!=='
    processed = processed.replace(/<>/g, '!==');
    processed = processed.replace(/(?<![<>=!])=(?!=)/g, '===');

    // Build the function library context
    const flattenNumbers = (args: any[]): number[] => {
      const nums: number[] = [];
      const walk = (item: any) => {
        if (Array.isArray(item)) {
          item.forEach(walk);
        } else {
          const n = Number(item);
          if (!isNaN(n)) nums.push(n);
        }
      };
      args.forEach(walk);
      return nums;
    };

    const ctx = {
      SUM: (...args: any[]) => {
        const nums = flattenNumbers(args);
        return nums.reduce((acc, curr) => acc + curr, 0);
      },
      AVERAGE: (...args: any[]) => {
        const nums = flattenNumbers(args);
        if (nums.length === 0) return 0;
        return nums.reduce((acc, curr) => acc + curr, 0) / nums.length;
      },
      AVG: (...args: any[]) => ctx.AVERAGE(...args),
      COUNT: (...args: any[]) => flattenNumbers(args).length,
      COUNTA: (...args: any[]) => {
        let count = 0;
        const walk = (item: any) => {
          if (Array.isArray(item)) {
            item.forEach(walk);
          } else if (item !== null && item !== undefined && item !== '' && item !== '---') {
            count++;
          }
        };
        args.forEach(walk);
        return count;
      },
      MAX: (...args: any[]) => {
        const nums = flattenNumbers(args);
        return nums.length > 0 ? Math.max(...nums) : 0;
      },
      MIN: (...args: any[]) => {
        const nums = flattenNumbers(args);
        return nums.length > 0 ? Math.min(...nums) : 0;
      },
      PRODUCT: (...args: any[]) => {
        const nums = flattenNumbers(args);
        if (nums.length === 0) return 0;
        return nums.reduce((acc, curr) => acc * curr, 1);
      },
      MULTIPLY: (...args: any[]) => ctx.PRODUCT(...args),
      ROUND: (num: any, digits: any = 0) => {
        const n = Number(num) || 0;
        const d = Number(digits) || 0;
        const factor = Math.pow(10, d);
        return Math.round(n * factor) / factor;
      },
      ROUNDUP: (num: any, digits: any = 0) => {
        const n = Number(num) || 0;
        const d = Number(digits) || 0;
        const factor = Math.pow(10, d);
        return Math.ceil(n * factor) / factor;
      },
      ROUNDDOWN: (num: any, digits: any = 0) => {
        const n = Number(num) || 0;
        const d = Number(digits) || 0;
        const factor = Math.pow(10, d);
        return Math.floor(n * factor) / factor;
      },
      ABS: (num: any) => Math.abs(Number(num) || 0),
      MOD: (num: any, divisor: any) => (Number(num) || 0) % (Number(divisor) || 1),
      POWER: (base: any, exp: any) => Math.pow(Number(base) || 0, Number(exp) || 1),
      SQRT: (num: any) => Math.sqrt(Math.max(0, Number(num) || 0)),
      IF: (condition: any, trueVal: any, falseVal: any = '') => (condition ? trueVal : falseVal),
      AND: (...args: any[]) => args.every(Boolean),
      OR: (...args: any[]) => args.some(Boolean),
      NOT: (val: any) => !val,
      CONCAT: (...args: any[]) => args.map(a => String(a ?? '')).join(''),
      CONCATENATE: (...args: any[]) => ctx.CONCAT(...args),
      TRIM: (s: any) => String(s ?? '').trim(),
      UPPER: (s: any) => String(s ?? '').toUpperCase(),
      LOWER: (s: any) => String(s ?? '').toLowerCase(),
      LEN: (s: any) => String(s ?? '').length,
      NOW: () => new Date().toLocaleString(),
      TODAY: () => new Date().toISOString().split('T')[0],
    };

    // Safely evaluate using Function with our explicit math & formula context
    const fnKeys = Object.keys(ctx);
    const fnVals = Object.values(ctx);
    const evaluator = new Function(...fnKeys, `"use strict"; return (${processed});`);
    const res = evaluator(...fnVals);

    return { result: res };
  } catch (err: any) {
    return {
      result: '#ERROR!',
      error: err?.message || 'Formula evaluation syntax error',
    };
  }
}
