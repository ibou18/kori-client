import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
        {t("headline", {
          defaultValue: "Suivez la santé de vos animaux en toute confiance !",
        })}
        <span className="relative">
          {" "}
          {t("subheadline", { defaultValue: "simplicité !" })}
          <span className="absolute bottom-0 left-0 w-full h-[10px] bg-none">
            <svg
              className="w-full h-full text-sky-500"
              viewBox="0 0 100 10"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M0 10 Q 50 0, 100 10 T 200 10" />
            </svg>
          </span>
        </span>
      </h1>
      <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
        {t("description", {
          defaultValue:
            "Simplifiez votre gestion de suivi de santé pour vos animaux. Enregistrez les mesures, vaccinations, et plus encore.",
        })}
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          href="/auth/register"
          className="rounded-md bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          {t("getStarted", { defaultValue: "Commencer maintenant" })}
        </Link>
        <Link
          href="/features"
          className="text-sm/6 font-semibold text-gray-900"
        >
          {t("learnMore", { defaultValue: "En savoir plus" })}{" "}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="mt-12 flow-root sm:mt-12">
        <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
          <Image
            alt="App screenshot"
            src="/images/screenshot.png"
            width={2432}
            height={1442}
            className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
          />
        </div>
      </div>
    </div>
  );
}
