"use client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase.config";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import UsersDisplay from "@/components/users/users-display";
import Chats from "@/components/chat/chats";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/Routes";

const Chat = () => {
  const { loadUserData, selectedUser } = useChat();
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
        {/* all users display */}
        <div className={cn(selectedUser ? "hidden sm:block" : "block")}>
          <UsersDisplay />
        </div>

        {/* chatting section */}
        <div className={cn(selectedUser ? "block" : "hidden sm:block")}>
          <Chats />
        </div>
      </div>
    </div>
  );
};

export default Chat;
