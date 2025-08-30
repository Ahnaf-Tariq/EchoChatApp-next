import React from "react";
import { IoChatboxEllipsesOutline } from "react-icons/io5";

const ChatGroupNotSelected = () => {
  return (
    <div className="h-[550px] bg-gray-50 flex flex-col justify-center items-center text-center p-8">
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <IoChatboxEllipsesOutline className="size-8" />
      </div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Welcome to Echo Chat
      </h1>
      <p className="text-gray-500 max-w-md">
        Select a conversation from the sidebar to start messaging, or create a
        new group to chat with multiple people.
      </p>
    </div>
  );
};

export default ChatGroupNotSelected;
