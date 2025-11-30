import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "500"],
});

export const metadata: Metadata = {
  title: "Fractal Wallpaper | Create fractal wallpapers",
  description: "A super simple tool to create fractal wallpapers.",
  metadataBase: new URL("https://fractal-glass-wallpaper.vercel.app"),
  openGraph: {
    title: "Fractal Wallpaper | Create fractal wallpapers",
    description: "A super simple tool to create fractal wallpapers.",
    type: "website",
    siteName: "Fractal Wallpaper",
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "https://fractal-glass-wallpaper.vercel.app/os-fractal.png",
        width: 1200,
        height: 630,
        alt: "Fractal Wallpaper",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fractal Wallpaper | Create fractal wallpapers",
    description: "A super simple tool to create fractal wallpapers.",
    images: ["https://fractal-glass-wallpaper.vercel.app/os-fractal.png"],
  },
};

// Wrape it with Wrapper component where we have custome wait logic besend on that we render main page or splash page.
// showBording ? <BordingComponent /> : <MainComponent />

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
