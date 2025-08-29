"use client";
import { Group } from "@/types/interfaces";
import { IoPeople, IoEllipsisVertical } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";

interface GroupListItemProps {
  group: Group;
  isSelected: boolean;
  onSelect: (group: Group) => void;
  onOptionsClick: (e: React.MouseEvent, group: Group) => void;
}

export default function GroupListItem({
  group,
  isSelected,
  onSelect,
  onOptionsClick,
}: GroupListItemProps) {
  const formatLastMessage = (message: string) => {
    return message.length > 30 ? `${message.substring(0, 30)}...` : message;
  };

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
      }`}
      onClick={() => onSelect(group)}
    >
      {/* Group Avatar */}
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {group.name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <IoPeople size={12} className="text-white" />
        </div>
      </div>

      {/* Group Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
          {group.lastMessageTime && (
            <span className="text-xs text-gray-500">
              {formatTime(group.lastMessageTime)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600 truncate">
            {group.lastMessage ? (
              formatLastMessage(group.lastMessage)
            ) : (
              <span className="text-gray-400 italic">No messages yet</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {group.memberDetails?.length || group.members.length} members
          </span>
          {group.description && (
            <span className="text-xs text-gray-400 truncate">
              • {group.description}
            </span>
          )}
        </div>
      </div>

      {/* Options Button */}
      <button
        onClick={(e) => onOptionsClick(e, group)}
        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
      >
        <IoEllipsisVertical size={16} className="text-gray-500" />
      </button>
    </div>
  );
}
