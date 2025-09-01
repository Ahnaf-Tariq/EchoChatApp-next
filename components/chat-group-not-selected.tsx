import { useCommonTranslations } from "@/hooks/useTranslations";
import React from "react";
import { IoChatboxEllipsesOutline } from "react-icons/io5";

const ChatGroupNotSelected = () => {
  const { t } = useCommonTranslations();
  return (
    <div className="h-[550px] bg-gray-50 flex flex-col justify-center items-center text-center p-8">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <IoChatboxEllipsesOutline className="size-8" />
      </div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        {t("chat.welcome_to_chat")}
      </h1>
      <p className="text-gray-500 max-w-md">{t("chat.select_conversation")}</p>
    </div>
  );
};

export default ChatGroupNotSelected;
