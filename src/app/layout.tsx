import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://komplid.ru"),
  title: {
    default: "Komplid — цифровое управление строительством | ERP для стройки",
    template: "%s | Komplid",
  },
  description:
    "ERP-платформа для строительных проектов: ИД, КС-2/КС-3, ОЖР, смета, стройконтроль, ТИМ. 18 модулей в одной системе. Пробный период 14 дней. Данные в РФ, ФЗ-152.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-theme="light"
      data-palette="steel"
      className={`${inter.variable} ${mono.variable}`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
