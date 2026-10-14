import { useState } from "react";
import Register from "./Register";

const lists = [
  "Smart priority scoring",
  "Duplicate detection",
  "Built for deadlines",
];

export default function WelcomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="bg-secondary min-h-screen flex flex-col">
      {/* ---------------nav------------------ */}
      <nav className="flex justify-between items-center py-3 px-5 sm:px-8 bg-navbar shadow-md">
        <div>
          <h2 className="font-logo font-bold text-lg italic text-secondary dark:text-white cursor-pointer">
            NextUp
          </h2>
        </div>
        <div>
          <button
            className="bg-secondary dark:bg-content dark:text-black px-3 py-1 text-center rounded hover:-translate-y-1 transition-transform font-outfit font-bold cursor-pointer text-sm sm:text-base"
            onClick={() => setIsLoginOpen(true)}
          >
            Log In
          </button>
        </div>
      </nav>

      {/* --------------section--------------- */}
      <section
        className={`font-sans flex flex-col items-center justify-center flex-1 px-5 sm:px-8 text-center transition-all ${
          isLoginOpen ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <p className="text-xs sm:text-sm font-semibold text-logo tracking-wide uppercase mb-3">
          For people with too much on their plate
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-logo leading-tight max-w-xl">
          Know what to do next,
          <br />
          without the guesswork
        </h1>

        <p className="text-gray-500 mt-5 max-w-md text-sm sm:text-base px-2">
          NextUp ranks your tasks by what actually matters, so you stop
          re-deciding your priorities every morning.
        </p>

        {/* --------------feature labels--------------- */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 mt-8 sm:mt-10 text-sm text-gray-500 items-start sm:items-center w-full max-w-xs sm:max-w-none sm:w-auto">
          {lists.map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0"></span>
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="w-full h-px bg-gray-300"></div>

      <footer className="text-center text-xs text-content py-4">
        © 2026 NextUp
      </footer>

      {isLoginOpen && <Register onClose={() => setIsLoginOpen(false)} />}
    </div>
  );
}