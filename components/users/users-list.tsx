import { useChat } from "@/context/ChatContext";
import { useCommonTranslations } from "@/hooks/useTranslations";
import { auth } from "@/lib/firebase.config";
import { cn } from "@/lib/utils";
import { User } from "@/types/chat.interfaces";
import React from "react";

interface UsersListProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
}

const UsersList = ({ user, isSelected, onSelect }: UsersListProps) => {
  const { getFirstLetterCapitalized } = useChat();
  const { t } = useCommonTranslations();
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors group",
        isSelected && "bg-[#5865f2] text-white",
        !isSelected && "hover:bg-[#3c3f44] text-[#b9bbbe] hover:text-white"
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            isSelected ? "bg-white text-[#5865f2]" : "bg-[#5865f2] text-white"
          )}
        >
          {getFirstLetterCapitalized(user.username)}
        </div>
        {user.active && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3ba55c] rounded-full border-2 border-[#2f3136]"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium capitalize truncate text-sm">
          {user.username}
        </p>
        <p className="text-xs truncate">
          {user.typing && user.typingTo === auth.currentUser?.uid ? (
            <span className="text-[#3ba55c]">{t("chat.typing")}</span>
          ) : (
            <span
              className={cn(isSelected ? "text-blue-100" : "text-[#72767d]")}
            >
              {user.active ? t("chat.online") : t("chat.offline")}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default UsersList;
