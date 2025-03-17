import Form from "next/form";

import { register } from "@/actions/register";

export default async function registerForm() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="">
        <Form action={register}>
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
          <br />
          <button type="submit">Submit</button>
        </Form>
      </div>
    </div>
  );
}
