import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg px-4 py-10">
      <section className="text-center space-y-6">
        <h1 className="text-6xl sm:text-7xl font-extrabold text-primary">
          404
        </h1>
        <p className="text-2xl sm:text-3xl font-semibold text-text">
          Page Not Found
        </p>
        <p className="text-sm sm:text-base text-secondary-accent">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition"
        >
          Go Back Home
        </button>
      </section>
    </main>
  );
}

export default NotFound;
