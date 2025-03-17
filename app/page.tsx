import Image from "next/image";
import Form from "next/form";

import { login } from "@/actions/login";

export default function Home() {
  return (
    <main className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 ">
      <div className="bg-[--background] text-[[--foreground]] text-center py-4">
        <section className="m-auto w-50">
          <Form action={login} className="border">
            {/* username */}
            <label id="uname">Username:</label>
            <br />
            <input name="uname" type="text" className="border" />
            <br />

            {/* password */}
            <label id="pass">Password:</label>
            <br />
            <input name="pass" className="border" />

            {/* submit button */}
            <a href="/sign-up">Register</a>
            <br />
            <button type="submit">Login</button>
          </Form>
        </section>
      </div>
    </main>
  );
}
