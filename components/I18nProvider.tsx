"use client";

import { PropsWithChildren, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

interface I18nProviderProps {
  locale: string;
}

export default function I18nProvider({
  children,
  locale,
}: PropsWithChildren<I18nProviderProps>) {
  useEffect(() => {
    // Change language when locale changes
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
