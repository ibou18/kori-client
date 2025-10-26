/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";

import { LOGO_BLACK } from "@/utils/utils";

import FormAddUser from "@/app/components/form/FormAddUser";

export default function RegisterPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="pb-5 pt-3 mt-10 lg:mt-5">
        <div className="px-0 lg:px-8 w-full">
          <div className="lg:mx-0 lg:p-10 rounded-2xl">
            <Image
              src={LOGO_BLACK}
              alt="logo"
              width={200}
              height={200}
              className="mx-auto -mt-16 mb-0"
            />
            <FormAddUser mode="register" />
          </div>
        </div>
      </div>
    </div>
  );
}
