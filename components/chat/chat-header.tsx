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
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedUser(null)}
              className="sm:hidden p-1 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <IoArrowBack className="size-5 text-gray-600" />
            </button>
            <div className="hidden sm:block relative">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getFirstLetterCapitalized(selectedUser.username)}
              </div>
              {selectedUser.active && (
                <span className="absolute bottom-0 right-0 block size-2 rounded-full bg-green-500 ring-2 ring-white"></span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800 capitalize">
                {selectedUser.username}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
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
          <button className="cursor-pointer">
            <BsExclamationCircle className="size-5 text-gray-600" />
          </button>
        </div>
      </div>
    )
  );
};

export default ChatHeader;
