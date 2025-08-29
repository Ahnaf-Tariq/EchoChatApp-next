import { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Set HTML dir attribute for RTL support
    const locale = router.locale;
    const dir = locale === "ur" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale || "en";
  }, [router.locale]);

  return <Component {...pageProps} />;
}

export default appWithTranslation(MyApp);
