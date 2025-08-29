"use client";

import { useTranslation } from "react-i18next";

export function useTranslations(namespace?: string) {
  return useTranslation(namespace);
}

export function useCommonTranslations() {
  return useTranslation();
}
