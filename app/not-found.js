import Link from "next/link";
import Image from "next/image";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content with the error message */}
      <main className="flex-grow bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="h-10 w-10 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the page you were looking for. It might have been
            moved or deleted.
          </p>
          <Button
            asChild
            className="bg-[#c3fa04] hover:bg-[#c3fa04]/90 text-black font-medium"
          >
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
