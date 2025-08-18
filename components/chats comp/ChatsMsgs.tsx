import { auth } from "@/app/firebase/config";
import React from "react";
import { MdDelete, MdPause, MdPlayArrow } from "react-icons/md";

interface Message {
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  type: "text" | "image" | "audio";
  timestamp: number;
}

interface ChatsMsgsProps {
  msg: Message;
  playingAudio: string | null;
  toggleAudio: (url: string) => void;
  deleteMsg: (timestamp: number) => void;
}

const ChatsMsgs = ({
  msg,
  playingAudio,
  toggleAudio,
  deleteMsg,
}: ChatsMsgsProps) => {
  return (
    <div
      className={`flex ${
        msg.senderId === auth.currentUser?.uid ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-xs lg:max-w-md px-2 sm:px-3 py-2 rounded-lg sm:rounded-2xl shadow-sm ${
          msg.type === "image"
            ? "bg-white p-0"
            : msg.senderId === auth.currentUser?.uid
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
        }`}
      >
        {/* Text Message */}
        {(msg.type === "text" || (!msg.type && msg.text)) && (
          <p className="text-sm leading-relaxed">{msg.text}</p>
        )}

        {/* Image Message */}
        {msg.type === "image" && msg.imageUrl && (
          <img
            src={msg.imageUrl}
            alt="chat image"
            className="rounded-lg object-cover w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] h-auto min-h-[120px] max-h-[200px] sm:max-h-[250px]"
          />
        )}

        {/* Voice Message */}
        {msg.type === "audio" && msg.audioUrl && (
          <div className="flex items-center gap-3 min-w-[150px]">
            <button
              onClick={() => toggleAudio(msg.audioUrl!)}
              className={`p-2 rounded-full cursor-pointer ${
                msg.senderId === auth.currentUser?.uid
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-200 hover:bg-gray-300"
              } transition-colors`}
            >
              {playingAudio === msg.audioUrl ? (
                <MdPause
                  className={`size-4 ${
                    msg.senderId === auth.currentUser?.uid
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                />
              ) : (
                <MdPlayArrow
                  className={`size-4 ${
                    msg.senderId === auth.currentUser?.uid
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                />
              )}
            </button>
            <div className="flex-1">
              <div
                className={`h-1 rounded-full ${
                  msg.senderId === auth.currentUser?.uid
                    ? "bg-blue-300"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-full w-2/3 rounded-full ${
                    msg.senderId === auth.currentUser?.uid
                      ? "bg-white"
                      : "bg-blue-500"
                  }`}
                ></div>
              </div>
              <p
                className={`text-xs mt-1 ${
                  msg.senderId === auth.currentUser?.uid
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}
              >
                Voice message
              </p>
            </div>
          </div>
        )}

        <p
          className={`text-xs mt-1 ${
            msg.type === "image"
              ? "text-gray-400"
              : msg.senderId === auth.currentUser?.uid
              ? "text-blue-100"
              : "text-gray-500"
          }`}
        >
          {new Date(msg.timestamp).toLocaleTimeString()}
        </p>

        {msg.senderId === auth.currentUser?.uid && (
          <button
            onClick={() => deleteMsg(msg.timestamp)}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
          >
            <MdDelete size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatsMsgs;
