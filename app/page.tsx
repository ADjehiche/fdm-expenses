import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#1c2c4c] text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div>
              <a
                id="site-logo"
                href="."
                title="fdm logo"
                className="items-center px-5 flex-none"
              >
                <svg
                  fill="none"
                  height="28"
                  viewBox="0 0 88 28"
                  width="88"
                  xmlns="http://www.w3.org/2000/svg"
                  className="logo"
                >
                  <path d="m42.7015 8.77008h-21.3986v19.10132h21.3986c2.9673 0 5.3754-2.4081 5.3754-5.3755v-8.3503c0-2.9674-2.4056-5.37552-5.3754-5.37552zm-2.5643 14.71832c0 1.3703-1.1109 2.4812-2.4812 2.4812h-8.4159v-15.2977h8.4159c1.3703 0 2.4812 1.1109 2.4812 2.4812zm-37.65602-14.71832h15.51682v1.90182h-9.64763c-.22923 0-.41312.1839-.41312.4131v5.9523h10.06075v1.9018h-10.05823v8.9298h-7.93977v-16.6176c0-1.37035 1.11086-2.48122 2.48118-2.48122zm77.28932-5.02785c2.6172-.97484 5.3856-2.17134 8.2295-3.61723v27.7464h-7.9373v-20.68071l-6.1916 11.41341v9.2648h-7.9397v-17.0408l-6.1917 11.4134v5.6299h-7.9397v-16.6227c0-1.34256 1.068-2.43831 2.4106-2.47862 1.859-.05541 3.7029-.20907 5.5291-.39044v9.87186l5.7811-10.65525c2.7154-.46601 5.5241-1.10331 8.3503-1.9119v8.93225l5.902-10.87437z" />
                </svg>
              </a>
            </div>
            <span className="font-bold text-3xl text-[#c3fa04]">
              Expense Tracker
            </span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/about"
              className="hover:text-[#c3fa04] transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#c3fa04] transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/login"
              className="hover:text-[#c3fa04] transition-colors"
            >
              Login
            </Link>
          </nav>
          <Button
            variant="outline"
            className="md:hidden text-white border-white hover:bg-[#c3fa04] hover:text-white"
          >
            Menu
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-[#1c2c4c] to-[#00AEEF] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Streamline Your Expense Management
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              The FDM Expense Tracker simplifies the process of submitting,
              approving, and managing expense claims.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-[#c3fa04] hover:bg-[#c3fa04]/90 text-black"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white text-[#1c2c4c] bg-gray-200"
              >
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#1c2c4c]">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-[#c3fa04] rounded-full flex items-center justify-center mb-4 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1c2c4c]">
                  Easy Claim Submission
                </h3>
                <p className="text-gray-600">
                  Create and submit expense claims with just a few clicks.
                  Upload evidence directly from your device.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-[#c3fa04] rounded-full flex items-center justify-center mb-4 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1c2c4c]">
                  Efficient Approval Process
                </h3>
                <p className="text-gray-600">
                  Line managers can quickly review, approve, or reject expense
                  claims with detailed feedback.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-[#c3fa04] rounded-full flex items-center justify-center mb-4 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1c2c4c]">
                  Comprehensive Tracking
                </h3>
                <p className="text-gray-600">
                  Monitor the status of all your expense claims from draft to
                  reimbursement in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1c2c4c] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">FDM Expense Tracker</h3>
              <p className="text-sm text-gray-300">
                Streamlining expense management for FDM consultants worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-[#c3fa04] transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-[#c3fa04] transition-colors"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="hover:text-[#c3fa04] transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#c3fa04] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#c3fa04] transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-[#c3fa04] transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@fdmgroup.com</li>
                <li>Phone: +44 123 456 7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-center text-gray-300">
            &copy; {new Date().getFullYear()} FDM Group. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
