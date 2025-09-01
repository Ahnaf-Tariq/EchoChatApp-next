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
        "flex items-center gap-3 px-2 sm:px-4 py-2 sm:py-3 cursor-pointer transition-colors",
        isSelected && "bg-blue-50 border-r-2 border-blue-500",
        !isSelected && "hover:bg-gray-100"
      )}
    >
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {getFirstLetterCapitalized(user.username)}
      </div>
      <div>
        <p className="font-semibold capitalize">{user.username}</p>
        <p className="text-sm text-gray-500">
          {user.typing && user.typingTo === auth.currentUser?.uid ? (
            <span className="text-green-600">{t("chat.typing")}</span>
          ) : (
            user.email
          )}
        </p>
      </div>
    </div>
  );
};

export default UsersList;
