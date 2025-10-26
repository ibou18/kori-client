/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function WelcomeComponent() {
  const { data: session }: any = useSession();
  const t = useTranslations("HomePage");
  return (
    <div>
      <h2>
        🎉 {t("welcome")} {session?.user.firstName}{" "}
      </h2>
    </div>
  );
}
