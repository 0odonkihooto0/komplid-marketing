import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Внешняя ссылка (на app.komplid.ru и т.п.) рендерится обычным <a>, внутренняя — <Link>.
export function isExternal(href: string): boolean {
  return href.startsWith('http');
}
