"use client";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";
import { GroupListProps } from "@/types/group.interfaces";
import { IoPeople } from "react-icons/io5";

export default function GroupList({
  group,
  isSelected,
  onSelect,
}: GroupListProps) {
  const { getFirstLetterCapitalized } = useChat();
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors",
        isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
      )}
      onClick={() => onSelect(group)}
    >
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {getFirstLetterCapitalized(group.name)}
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <IoPeople size={12} className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {group.members.length} members
          </span>
        </div>
      </div>
    </div>
  );
}
