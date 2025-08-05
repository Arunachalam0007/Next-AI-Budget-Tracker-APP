import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Budget Tracker",
  description: "This app to track your budget with AI assistance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="min-h-screen"> {children} </main>

        {/* Footer */}
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto  px-4 text-center text-grey-600">
            <p>Made with ❤️ by ArunSha</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
