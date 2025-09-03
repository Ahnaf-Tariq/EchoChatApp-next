"use client";
import { auth } from "@/lib/firebase.config";
import { cn } from "@/lib/utils";
import { ChatMessagesProps } from "@/types/chat.interfaces";
import Image from "next/image";
import { useState } from "react";
import { MdDoneAll, MdPause, MdPlayArrow } from "react-icons/md";
import EmojiModal from "../emoji-modal";
import { MessageType } from "@/types/enums";

const ChatMessages = ({
  message,
  playingAudio,
  isPaused,
  toggleAudio,
  deleteMessage,
  addEmoji,
  deleteEmoji,
}: ChatMessagesProps) => {
  const [menuOption, setmenuOption] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isOwnMessage = message.senderId === auth.currentUser?.uid;

  const getReactionCounts = () => {
    if (!message.reactions) return [];

    return Object.entries(message.reactions)
      .map(([emoji, userIds]) => ({
        emoji,
        count: userIds.length,
        hasReacted: userIds.includes(auth.currentUser?.uid || ""),
      }))
      .filter((reaction) => reaction.count > 0);
  };

  const reactionCounts = getReactionCounts();

  return (
    <div
      className="flex mb-1 px-2 py-1 hover:bg-[#32353b] group"
      onMouseEnter={() => setmenuOption(true)}
      onMouseLeave={() => {
        if (!showEmojiPicker) {
          setmenuOption(false);
        }
      }}
    >
      <div className="relative max-w-[70%] -space-y-1">
        {menuOption && (
          <EmojiModal
            isOwnMessage={isOwnMessage}
            messageTimestamp={message.timestamp}
            reactions={message.reactions}
            addEmoji={addEmoji}
            deleteEmoji={deleteEmoji}
            deleteMessage={deleteMessage}
            menuOption={menuOption}
            setmenuOption={setmenuOption}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
          />
        )}

        <div
          className={cn(
            "flex gap-2",
            message.type !== MessageType.IMAGE &&
              "border border-gray-600 p-2 rounded-xl"
          )}
        >
          {!isOwnMessage && message.type !== MessageType.AUDIO && (
            <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              U
            </div>
          )}

          <div className="flex-1 min-w-0">
            {!isOwnMessage && (
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-[#ffffff] text-sm">
                  User
                </span>
                <span className="text-[#72767d] text-xs">
                  {new Date(message.timestamp).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Message Content */}
            <div className="relative">
              {message.type === "text" && message.text && (
                <p className="text-[#dcddde] text-sm break-words leading-relaxed">
                  {message.text}
                </p>
              )}

              {message.type === "image" && message.imageUrl && (
                <div className="mt-1">
                  <Image
                    src={message.imageUrl}
                    alt="chat image"
                    className="rounded-lg object-cover max-w-[160px] sm:max-w-[180px] md:max-w-[220px] h-auto min-h-[120px] max-h-[200px] sm:max-h-[250px]"
                    width={400}
                    height={300}
                  />
                </div>
              )}

              {message.type === "audio" && message.audioUrl && (
                <div className="flex items-center gap-3 min-w-[200px] mt-1">
                  <button
                    onClick={() => toggleAudio(message.audioUrl!)}
                    className="p-2 bg-[#5865f2] hover:bg-[#4752c4] rounded-full cursor-pointer transition-colors"
                  >
                    {playingAudio === message.audioUrl && !isPaused ? (
                      <MdPause className="size-4 text-white" />
                    ) : (
                      <MdPlayArrow className="size-4 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="h-1 bg-[#4f545c] rounded-full">
                      <div className="h-full w-2/3 bg-[#5865f2] rounded-full"></div>
                    </div>
                    <p className="text-[#72767d] text-xs mt-1">Voice message</p>
                  </div>
                </div>
              )}

              {isOwnMessage && (
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[#72767d] text-xs">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <MdDoneAll
                    className={cn(
                      "size-3",
                      message.hasUserSeen ? "text-[#3ba55c]" : "text-[#72767d]"
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {reactionCounts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {reactionCounts.map((reaction) => (
              <div
                key={reaction.emoji}
                onClick={() => deleteEmoji(message.timestamp, reaction.emoji)}
                className={cn(
                  "flex items-center gap-1 px-1 py-0.5 rounded-full text-xs cursor-pointer border",
                  reaction.hasReacted
                    ? "bg-[#5865f2] border-[#5865f2] text-white"
                    : "bg-[#2f3136] border-[#4f545c] text-[#b9bbbe] hover:border-[#5865f2]"
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
