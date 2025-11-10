/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetUsersbyToken } from "@/app/data/hooks";
import ResetForm from "@/components/reset-form";

import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token: any = searchParams.get("token");

  const { data: userByToken }: any = useGetUsersbyToken(token);

  if (!token) {
    return <div>Invalid token</div>;
  }

  console.log("userByToken", userByToken);
  return (
    <main className="mx-auto min-h-screen max-w-2xl mt-12">
      <ResetForm user={userByToken} token={token} />
    </main>
  );
}
