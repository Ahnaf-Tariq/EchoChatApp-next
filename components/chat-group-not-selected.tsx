import { useCommonTranslations } from "@/hooks/useTranslations";
import React from "react";
import { IoChatboxEllipsesOutline } from "react-icons/io5";

const ChatGroupNotSelected = () => {
  const { t } = useCommonTranslations();
  return (
    <div className="min-h-[550px] bg-[#36393f] flex flex-col border border-l-0 border-gray-800 justify-center items-center text-center p-8">
      <div className="w-20 h-20 bg-[#2f3136] rounded-full flex items-center justify-center mb-4 border border-[#4f545c]">
        <IoChatboxEllipsesOutline className="size-8 text-[#5865f2]" />
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">
        {t("chat.welcome_to_chat")}
      </h1>
      <p className="text-[#b9bbbe] max-w-md">{t("chat.select_conversation")}</p>
    </div>
  );
};

export default ChatGroupNotSelected;
