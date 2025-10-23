export function FieldBackground() {
  const yards = [10, 20, 30, 40];
  return (
    <div className="bg-black h-screen w-full flex flex-col justify-around absolute top-0 left-0">
      {yards.map((yard) => (
        <div key={yard} className="relative h-[2px] bg-white">
          {/* côté gauche */}
          <span
            className={`absolute -top-10 left-3 font-mono text-white text-2xl transform rotate-90`}
          >
            {yard}
          </span>
          {/* côté droit */}
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
