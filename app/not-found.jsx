import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 text-center ">
      {/* <Image
        src="/Page Not Found 404.gif"
        alt="Investor standing in front of charts – 404"
        width={300} 
        height={300}
        priority
        className="mb-6 max-w-xs"x
      /> */}

      <h1 className="text-6xl font-bold animate-bounce gradient-title bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-pink-600 ">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Looks like you're lost—let’s guide you back to tracking your finances.
      </p>

      <Link href="/">
        <Button size="lg">Return Home</Button>
      </Link>
    </div>
  );
}
