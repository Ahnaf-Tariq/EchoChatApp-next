"use client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase.config";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import UsersDisplay from "@/components/users/users-display";
import Chats from "@/components/chat/chats";
import GroupChat from "@/components/group/group-chat";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/Routes";
import ChatGroupNotSelected from "@/components/chat-group-not-selected";

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
    <div className="bg-[#36393f] min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-[300px_1fr]">
        {/* Sidebar Display */}
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
            <GroupChat group={selectedGroup} />
          ) : (
            <ChatGroupNotSelected />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
