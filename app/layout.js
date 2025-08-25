import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Budget Tracker",
  description: "This app to track your budget with AI assistance",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          {/* Header Here we are calling clerk Auth and DB */}
          <Header />

          {/* Main content */}
          <main className="min-h-screen"> {children} </main>
          <Toaster position="bottom-center" richColors />

          {/* Footer */}
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto  px-4 text-center text-grey-600">
              <p>Made with ❤️ by ArunSha</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
