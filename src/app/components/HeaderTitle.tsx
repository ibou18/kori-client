export default function HeaderTitle({ title }: { title: string }) {
  return (
    <header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 mb-5">
        <h1 className="text-3xl pl-10 py-3 rounded-br-xl rounded-bl-xl shadow-lg first-letter:text-orange-500 first-letter:font-black first-letter:text-5xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h1>
      </div>
    </header>
  );
}
