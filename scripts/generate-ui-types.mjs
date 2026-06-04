import fs from 'fs';
import path from 'path';

const UI_DIR = path.join(process.cwd(), 'src/components/ui');

const FC =
  'React.ForwardRefExoticComponent<React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>>';
const CC = 'React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>';
const FN = '(...args: unknown[]): unknown';

function typeForExport(name) {
  if (name.startsWith('use')) return 'hook';
  if (/Variants$|Style$/.test(name)) return 'fn';
  return 'fc';
}

function parseExports(content) {
  const block = content.match(/export\s*\{([^}]+)\}/s);
  if (block) {
    return block[1]
      .split(',')
      .map((part) =>
        part
          .trim()
          .split(/\s+as\s+/)
          .pop()
          .trim()
      )
      .filter(Boolean);
  }
  return [...content.matchAll(/export const (\w+)/g)].map((m) => m[1]);
}

function generateDts(baseName, exports) {
  const lines = ["import * as React from 'react';", ''];

  if (baseName === 'badge') {
    lines.push(
      'export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {',
      '  variant?: string;',
      '}',
      'export const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLDivElement>>;',
      'export function badgeVariants(...args: unknown[]): string;',
      ''
    );
    return lines.join('\n');
  }

  if (baseName === 'button') {
    lines.push(
      'export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {',
      '  variant?: string;',
      '  size?: string;',
      '  asChild?: boolean;',
      '}',
      'export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;',
      'export function buttonVariants(...args: unknown[]): string;',
      ''
    );
    return lines.join('\n');
  }

  if (baseName === 'input') {
    lines.push(
      'export const Input: React.ForwardRefExoticComponent<',
      '  React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>',
      '>;',
      ''
    );
    return lines.join('\n');
  }

  if (baseName === 'textarea') {
    lines.push(
      'export const Textarea: React.ForwardRefExoticComponent<',
      '  React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>',
      '>;',
      ''
    );
    return lines.join('\n');
  }

  if (baseName === 'label') {
    lines.push(
      'export const Label: React.ForwardRefExoticComponent<',
      '  React.LabelHTMLAttributes<HTMLLabelElement> & React.RefAttributes<HTMLLabelElement>',
      '>;',
      ''
    );
    return lines.join('\n');
  }

  for (const name of exports) {
    const kind = typeForExport(name);
    if (kind === 'hook') {
      lines.push(`export function ${name}(): Record<string, unknown>;`);
    } else if (kind === 'fn') {
      lines.push(`export function ${name}${FN};`);
    } else {
      lines.push(`export const ${name}: ${FC};`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

for (const file of fs.readdirSync(UI_DIR)) {
  if (!file.endsWith('.jsx')) continue;
  const baseName = file.replace(/\.jsx$/, '');
  const content = fs.readFileSync(path.join(UI_DIR, file), 'utf8');
  const exports = parseExports(content);
  if (exports.length === 0) continue;
  const dts = generateDts(baseName, exports);
  fs.writeFileSync(path.join(UI_DIR, `${baseName}.d.ts`), dts);
  console.log(`Wrote ${baseName}.d.ts (${exports.length} exports)`);
}
