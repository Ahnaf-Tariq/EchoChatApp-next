"use client";
import { useChat } from "@/context/ChatContext";
import { useCommonTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { GroupListProps } from "@/types/group.interfaces";
import { IoPeople } from "react-icons/io5";

export default function GroupList({
  group,
  isSelected,
  onSelect,
}: GroupListProps) {
  const { getFirstLetterCapitalized } = useChat();
  const { t } = useCommonTranslations();
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors group",
        isSelected
          ? "bg-[#5865f2] text-white"
          : "hover:bg-[#3c3f44] text-[#b9bbbe] hover:text-white"
      )}
      onClick={() => onSelect(group)}
    >
      <div className="relative">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            isSelected
              ? "bg-white text-blue-500"
              : "bg-gradient-to-br  from-blue-500 to-purple-600 text-white"
          )}
        >
          {getFirstLetterCapitalized(group.name)}
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#3ba55c] rounded-full border-2 border-[#2f3136] flex items-center justify-center">
          <IoPeople size={12} className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate text-sm">{group.name}</h3>
        <p className="text-xs truncate">
          <span className={cn(isSelected ? "text-blue-100" : "text-[#72767d]")}>
            {group.members.length} {t("chat.members")}
          </span>
        </p>
      </div>
    </div>
  );
}
