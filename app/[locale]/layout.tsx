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
  const dir = params.locale === "ur" ? "rtl" : "ltr";

  return (
    <html lang={params.locale} dir={dir}>
      <body className="bg-[#36393f] text-white pt-4 sm:pt-8 scrollbar-hide">
        <I18nProvider locale={params.locale}>
          <ToastContainer />
          <ChatProvider>{children}</ChatProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
