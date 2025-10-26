import Link from "next/link";

export default function Cancel() {
  return (
    <div className="mx-auto text-center">
      <h1>
        <span className="text-xl font-extrabold"> Oupss ! </span>
      </h1>
      <h2>Votre paiement a été annuler </h2>

      <p>
        Vous pouvez reprendre votre paiement en cliquant sur le bouton
        ci-dessous
      </p>
      <div className="mt-10 mx-auto flex flex-row gap-5 justify-center">
        <Link
          href="/pricing"
          className="bg-teal-500 px-4 py-2 text-center text-white rounded-lg shadow-xl shadow-slate-500/20"
        >
          Reprendre le paiement
        </Link>
        ou
        <Link
          href="/pricing"
          className="bg-orange-500 px-4 py-2 text-center text-white rounded-lg shadow-xl shadow-slate-500/20"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
