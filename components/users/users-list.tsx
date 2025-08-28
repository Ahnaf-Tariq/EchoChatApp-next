import { useChat } from "@/context/ChatContext";
import { auth } from "@/lib/firebase.config";
import { cn } from "@/lib/utils";
import { User } from "@/types/interfaces";
import Image from "next/image";
import React from "react";

const UsersList = ({ user }: { user: User }) => {
  const { selectedUser, setSelectedUser } = useChat();
  return (
    <div
      onClick={() => setSelectedUser(user)}
      className={cn(
        "flex items-center gap-3 px-2 sm:px-4 py-2 sm:py-3 cursor-pointer transition-colors",
        selectedUser?.id === user.id && "bg-blue-100",
        selectedUser?.id !== user.id && "hover:bg-gray-100"
      )}
    >
      <div>
        <Image
          src="/assests/avatar.webp"
          alt="profile"
          className="rounded-full border border-gray-300"
          width={40}
          height={40}
        />
      </div>
      <div>
        <p className="font-semibold">
          {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
        </p>
        <p className="text-sm text-gray-500">
          {user.typing && user.typingTo === auth.currentUser?.uid ? (
            <span className="text-green-600">Typing...</span>
          ) : (
            user.email
          )}
        </p>
      </div>
    </div>
  );
};

export default UsersList;
