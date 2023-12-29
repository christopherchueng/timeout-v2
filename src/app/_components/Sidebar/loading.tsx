const Loading = () => (
  <aside className="h-full w-full overflow-y-hidden sm:w-72 sm:flex-none">
    <ul className="flex h-full flex-col gap-4 px-4">
      {Array.from({ length: 20 }).map((_, idx) => (
        <li
          key={idx}
          className="h-10 w-full animate-pulse rounded-lg border border-transparent bg-gray-200 px-2 py-4 transition"
        ></li>
      ))}
    </ul>
  </aside>
);

export default Loading;
