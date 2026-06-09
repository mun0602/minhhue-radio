import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./radio.css";

export const metadata: Metadata = {
  title: "Phát Thanh Minh Huệ",
  description: "Trang tuyển tập phát thanh Minh Huệ Radio cao cấp.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Minh Huệ Radio",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
