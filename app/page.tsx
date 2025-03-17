import Link from "next/link";
import Form from "next/form";

import { login } from "@/actions/login";

export default function Home() {
  return (
    <div className="bg-[--background] text-[[--foreground]] text-center py-4">
      <section className="m-auto w-50">
        <Form action={login} className="border">
          {/* username */}
          <label htmlFor="uname">Username:</label>
          <br />
          <input id="uname" name="username" type="text" className="border" />
          <br />

          {/* password */}
          <label htmlFor="pass">Password:</label>
          <br />
          <input id="pass" name="password" className="border" />

          {/* submit button */}
          <Link href="/sign-up" className="lnk">Register</Link>
          <br />
          <button type="submit" className="btn">
            Login
          </button>
        </Form>
      </section>
    </div>
  );
}
