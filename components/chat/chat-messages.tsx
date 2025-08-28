"use client";
import { auth } from "@/lib/firebase.config";
import { cn } from "@/lib/utils";
import { ChatMessagesProps } from "@/types/interfaces";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  MdDelete,
  MdDoneAll,
  MdOutlineEmojiEmotions,
  MdPause,
  MdPlayArrow,
} from "react-icons/md";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

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
  const [reactEmoji, setReactEmoji] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwnMessage = message.senderId === auth.currentUser?.uid;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setmenuOption(false);
        setShowEmojiPicker(false);
        setReactEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOption]);

  const handleEmojiClick = (emoji: string) => {
    if (message.reactions && message.reactions[emoji]) {
      deleteEmoji(message.timestamp, emoji);
    } else {
      addEmoji(message.timestamp, emoji);
    }

    setShowEmojiPicker(false);
    setmenuOption(false);
    setReactEmoji(false);
  };

  const handleDeleteClick = () => {
    deleteMessage(message.timestamp);
    setmenuOption(false);
    setReactEmoji(false);
  };

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
        {/* Three dots menu */}
        {menuOption && (
          <div
            ref={menuRef}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-50",
              isOwnMessage
                ? "left-0 -translate-x-full"
                : "right-0 translate-x-full"
            )}
          >
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                <BsThreeDotsVertical className="size-4 text-gray-600" />
              </button>

              {showEmojiPicker && (
                <div
                  className={cn(
                    "absolute top-8 bg-white rounded-lg shadow-md border border-gray-400 p-1 z-20",
                    isOwnMessage ? "right-0" : "left-0"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <button
                        onClick={() => setReactEmoji(!reactEmoji)}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left cursor-pointer"
                      >
                        <MdOutlineEmojiEmotions className="size-4" />
                        React
                      </button>

                      {reactEmoji && (
                        <div
                          className={cn(
                            "absolute bottom-[34px] bg-white rounded-lg shadow-lg border border-gray-400 p-1 flex gap-1",
                            isOwnMessage
                              ? "right-[-120px] sm:right-0"
                              : "left-[-105px] sm:left-0"
                          )}
                        >
                          {EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleEmojiClick(emoji)}
                              className="text-lg hover:bg-gray-100 rounded p-1 cursor-pointer transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isOwnMessage && (
                      <button
                        onClick={handleDeleteClick}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      >
                        <MdDelete className="size-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
