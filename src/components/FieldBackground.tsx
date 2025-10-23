export function FieldBackground() {
  const yards = [10, 20, 30, 40];
  return (
    <div className="fixed inset-0 bg-black flex flex-col justify-around -z-10">
      {yards.map((yard) => (
        <div key={yard} className="relative h-[2px] bg-white">
          <span
            className={`absolute -top-10 left-3 font-mono text-white text-2xl transform rotate-90`}
          >
            {yard}
          </span>
          <span
            className={`absolute -top-10 right-3 font-mono text-white text-2xl transform -rotate-90`}
          >
            {yard}
          </span>
        </div>
      ))}
    </div>
  );
}
