import { useTheme } from "../contexts/ThemeContext";

export default function LoadingSpinner() {
  const { isDarkMode } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Outer circle */}
          <div
            className={`w-16 h-16 rounded-full border-8 ${
              isDarkMode ? "border-primary-dark/20" : "border-primary/20"
            }`}
          ></div>

          {/* Animated spinner */}
          <div
            className={`absolute top-0 left-0 w-16 h-16 rounded-full border-8 ${
              isDarkMode ? "border-primary-dark" : "border-primary"
            } border-t-transparent animate-spin`}
          ></div>
        </div>
        <p className="mt-4 text-white dark:text-dark-DEFAULT text-lg">
          Loading...
        </p>
      </div>
    </div>
  );
}
