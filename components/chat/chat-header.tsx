"use client";
import Image from "next/image";
import React from "react";
import { BsExclamationCircle } from "react-icons/bs";
import { IoArrowBack } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
import { useChat } from "@/context/ChatContext";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChat();

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
              <Image
                className="rounded-full ring-2 ring-gray-100"
                src="/assests/avatar.webp"
                alt=""
                width={40}
                height={40}
              />
              {/* Active Status Dot */}
              {selectedUser.active && (
                <span className="absolute bottom-0 right-0 block size-3 rounded-full bg-green-500 ring-2 ring-white"></span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800 capitalize">
                {selectedUser.username}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {selectedUser.active
                  ? "Active Now"
                  : `Last seen: ${formatDistanceToNow(
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
