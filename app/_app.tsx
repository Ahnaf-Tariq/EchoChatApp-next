import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import I18nProvider from "../components/I18nProvider";
import "./globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Set HTML dir attribute for RTL support
    const locale = router.locale;
    const dir = locale === "ur" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale || "en";
  }, [router.locale]);

  return (
    <I18nProvider locale={router.locale || "en"}>
      <Component {...pageProps} />
    </I18nProvider>
  );
}

export default MyApp;
