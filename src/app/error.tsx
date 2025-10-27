"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Oups ! Une erreur s&apos;est produite
        </h1>
        <p className="mb-6 text-gray-600">
          Nous sommes désolés pour ce problème. Veuillez réessayer.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </div>
  );
}
