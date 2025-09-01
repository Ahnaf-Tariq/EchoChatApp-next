"use client";
import { auth } from "@/lib/firebase.config";
import { cn } from "@/lib/utils";
import { ChatMessagesProps } from "@/types/chat.interfaces";
import Image from "next/image";
import { useState } from "react";
import { MdDoneAll, MdPause, MdPlayArrow } from "react-icons/md";
import EmojiModal from "../emoji-modal";

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
      className={cn(
        "flex mb-2",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      <div
        className="relative group max-w-xs lg:max-w-md"
        onMouseEnter={() => setmenuOption(true)}
        onMouseLeave={() => {
          if (!showEmojiPicker) {
            setmenuOption(false);
          }
        }}
      >
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

        {/* Message Content */}
        <div
          className={cn(
            "rounded-2xl",
            message.type === "image" && "bg-white p-2",
            message.type !== "image" &&
              (isOwnMessage
                ? "bg-blue-500 text-white rounded-br-sm p-3"
                : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm p-3")
          )}
        >
          {message.type === "text" && message.text && (
            <p className="text-sm break-words">{message.text}</p>
          )}

          {message.type === "image" && message.imageUrl && (
            <Image
              src={message.imageUrl}
              alt="chat image"
              className="rounded-lg object-cover w-full max-w-[160px] sm:max-w-[180px] md:max-w-[220px] h-auto min-h-[120px] max-h-[200px] sm:max-h-[250px]"
              width={400}
              height={400}
            />
          )}

          {message.type === "audio" && message.audioUrl && (
            <div className="flex items-center gap-3 min-w-[150px]">
              <button
                onClick={() => toggleAudio(message.audioUrl!)}
                className={cn(
                  "p-2 rounded-full cursor-pointer transition-colors",
                  isOwnMessage
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-200 hover:bg-gray-300"
                )}
              >
                {playingAudio === message.audioUrl && !isPaused ? (
                  <MdPause
                    className={cn(
                      "size-4",
                      isOwnMessage ? "text-white" : "text-gray-600"
                    )}
                  />
                ) : (
                  <MdPlayArrow
                    className={cn(
                      "size-4",
                      isOwnMessage ? "text-white" : "text-gray-600"
                    )}
                  />
                )}
              </button>
              <div className="flex-1">
                <div
                  className={cn(
                    "h-1 rounded-full",
                    isOwnMessage ? "bg-blue-300" : "bg-gray-300"
                  )}
                >
                  <div
                    className={cn(
                      "h-full w-2/3 rounded-full",
                      isOwnMessage ? "bg-white" : "bg-blue-500"
                    )}
                  ></div>
                </div>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isOwnMessage ? "text-blue-100" : "text-gray-500"
                  )}
                >
                  Voice message
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-1 mt-1">
            <p
              className={cn(
                "text-xs",
                message.type === "image"
                  ? "text-gray-400"
                  : isOwnMessage
                  ? "text-blue-100"
                  : "text-gray-500"
              )}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
            {isOwnMessage && (
              <MdDoneAll
                className={cn(
                  "size-4",
                  message.hasUserSeen ? "text-green-300" : "text-gray-400"
                )}
              />
            )}
          </div>
        </div>

        {reactionCounts.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1 mt-1",
              isOwnMessage ? "justify-end" : "justify-start"
            )}
          >
            {reactionCounts.map((reaction) => (
              <div
                key={reaction.emoji}
                onClick={() => deleteEmoji(message.timestamp, reaction.emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer border",
                  reaction.hasReacted
                    ? "bg-blue-100 border-blue-300"
                    : "bg-gray-100 border-gray-300"
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600">{reaction.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
