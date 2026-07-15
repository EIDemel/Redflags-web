import { useLanguage } from "../i18n";
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex rounded-full border border-slate-300 p-1 text-xs font-black">
      <button
        type="button"
        onClick={() => setLanguage("fr")}
        className={
          language === "fr"
            ? "rounded-full bg-rose-500 px-2 py-1 text-white"
            : "rounded-full px-2 py-1"
        }
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={
          language === "en"
            ? "rounded-full bg-rose-500 px-2 py-1 text-white"
            : "rounded-full px-2 py-1"
        }
      >
        EN
      </button>
    </div>
  );
}
