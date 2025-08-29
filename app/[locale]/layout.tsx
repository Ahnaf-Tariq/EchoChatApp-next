import { ChatProvider } from "@/context/ChatContext";
import { ToastContainer } from "react-toastify";
import I18nProvider from "@/components/I18nProvider";
import { PropsWithChildren } from "react";

export default function LocaleLayout({
  children,
  params,
}: PropsWithChildren<{
  params: { locale: string };
}>) {
  return (
    <I18nProvider locale={params.locale}>
      <ToastContainer />
      <ChatProvider>{children}</ChatProvider>
    </I18nProvider>
  );
}
