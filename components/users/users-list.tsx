import { auth } from "@/lib/firebase.config";
import { cn } from "@/lib/utils";
import { User } from "@/types/interfaces";
import Image from "next/image";
import React from "react";

interface UsersListProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
}

const UsersList = ({ user, isSelected, onSelect }: UsersListProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 px-2 sm:px-4 py-2 sm:py-3 cursor-pointer transition-colors",
        isSelected && "bg-blue-50 border-r-2 border-blue-500",
        !isSelected && "hover:bg-gray-100"
      )}
    >
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {user.username.charAt(0).toUpperCase()}
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
