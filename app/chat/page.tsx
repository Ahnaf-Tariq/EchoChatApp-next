"use client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase.config";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import UsersDisplay from "@/components/users/users-display";
import Chats from "@/components/chat/chats";
import GroupChatWindow from "@/components/group/group-chat-window";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/Routes";
import { IoChatboxEllipsesOutline } from "react-icons/io5";

const Chat = () => {
  const { loadUserData, selectedUser, selectedGroup } = useChat();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace(Routes.login);
      } else {
        loadUserData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto my-3 sm:my-6 grid grid-cols-1 sm:grid-cols-[1fr_2fr] shadow-md">
        {/* Sidebar - Users and Groups */}
        <div
          className={cn(
            selectedUser || selectedGroup ? "hidden sm:block" : "block"
          )}
        >
          <UsersDisplay />
        </div>

        {/* Chat Section */}
        <div
          className={cn(
            selectedUser || selectedGroup ? "block" : "hidden sm:block"
          )}
        >
          {selectedUser ? (
            <Chats />
          ) : selectedGroup ? (
            <GroupChatWindow group={selectedGroup} />
          ) : (
            <div className="h-[550px] bg-gray-50 flex flex-col justify-center items-center text-center p-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <IoChatboxEllipsesOutline className="size-8" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to Echo Chat
              </h1>
              <p className="text-gray-500 max-w-md">
                Select a conversation from the sidebar to start messaging, or
                create a new group to chat with multiple people.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
