import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/animations/MaskTransition";
import Navbar from "@/components/layout/Navbar";
import SyncProfile from "@/components/auth/SyncProfile";
import { Fraunces, DM_Sans } from "next/font/google";
import "../styles/globals.css";

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Byte & Build — Immersive Editorial",
    template: "%s | Byte & Build",
  },
  description: "A private luxury-designed collaborative space for writers and thinkers.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Byte & Build",
    description: "A private luxury-designed collaborative space for writers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${headingFont.variable} ${bodyFont.variable} scroll-smooth`}
      >
        <body className="antialiased">
          <ThemeProvider>
            <SyncProfile />
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--muted-foreground)] bg-[var(--background)] transition-colors duration-300">
                <div className="mx-auto max-w-7xl px-6">
                  <p className="font-serif-editorial italic text-[var(--foreground)] opacity-80 text-sm mb-2">
                    Byte & Build
                  </p>
                  <p>© {new Date().getFullYear()} — Reserved for Selected Minds.</p>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
