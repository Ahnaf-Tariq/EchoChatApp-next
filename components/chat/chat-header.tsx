"use client";
import React from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
import { useChat } from "@/context/ChatContext";
import { useCommonTranslations } from "@/hooks/useTranslations";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, getFirstLetterCapitalized } =
    useChat();
  const { t } = useCommonTranslations();
  return (
    selectedUser && (
      <div className="bg-[#2f3136] border-b border-[#4f545c] px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedUser(null)}
              className="sm:hidden p-1 hover:bg-[#3c3f44] rounded-full cursor-pointer transition-colors"
            >
              <IoArrowBack className="size-5 text-[#b9bbbe]" />
            </button>
            <div className="hidden sm:block relative">
              <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getFirstLetterCapitalized(selectedUser.username)}
              </div>
              {selectedUser.active && (
                <span className="absolute bottom-0 right-0 block size-2 rounded-full bg-[#3ba55c] ring-2 ring-[#2f3136]"></span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white capitalize">
                {selectedUser.username}
              </h1>
              <p className="text-xs sm:text-sm text-[#b9bbbe]">
                {selectedUser.active
                  ? t("chat.active_now")
                  : `${t("chat.last_seen")}: ${formatDistanceToNow(
                      new Date(selectedUser.lastSeen),
                      {
                        addSuffix: true,
                      }
                    )}`}
              </p>
            </div>
          </div>
          <button className="cursor-pointer p-1 hover:bg-[#3c3f44] rounded-full transition-colors">
            <BsExclamationCircle className="size-5 text-[#b9bbbe] hover:text-white" />
          </button>
        </div>
      </div>
    )
  );
};

export default ChatHeader;
