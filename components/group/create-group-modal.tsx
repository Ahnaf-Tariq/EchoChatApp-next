"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase.config";
import { User } from "@/types/chat.interfaces";
import { collection, onSnapshot } from "firebase/firestore";
import { useGroupChat } from "@/hooks/useGroupChat";
import { IoClose, IoPeople, IoAdd, IoRemove } from "react-icons/io5";
import { CreateGroupModalProps } from "@/types/group.interfaces";
import { cn } from "@/lib/utils";
import { useChat } from "@/context/ChatContext";
import { useCommonTranslations } from "@/hooks/useTranslations";

export default function CreateGroupModal({
  showCreateGroupModal,
  setShowCreateGroupModal,
}: CreateGroupModalProps) {
  const { t } = useCommonTranslations();
  const { getFirstLetterCapitalized } = useChat();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { createGroup, loading } = useGroupChat();

  useEffect(() => {
    if (!showCreateGroupModal) return;

    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as User))
        .filter((user) => user.id !== auth.currentUser?.uid);
      setAvailableUsers(users);
    });

    return () => unsubscribe();
  }, [showCreateGroupModal]);

  const filteredUsers = availableUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    try {
      await createGroup(groupName.trim(), selectedUsers);

      setShowCreateGroupModal(false);
      setGroupName("");
      setSelectedUsers([]);
      setSearchTerm("");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const closeButton = () => {
    setShowCreateGroupModal(false);
    setGroupName("");
    setSelectedUsers([]);
    setSearchTerm("");
  };
  return (
    showCreateGroupModal && (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#36393f] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-blue-500 text-xl font-bold">
              {t("group_modal.create_group")}
            </h2>
            <button
              onClick={closeButton}
              className="text-gray-500 cursor-pointer"
            >
              <IoClose size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 font-medium mb-2">
                {t("group_modal.group_name")}
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder={t("group_modal.enter_group_name")}
                maxLength={50}
              />
            </div>

            {/* Selected Members */}
            {selectedUsers.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  {t("group_modal.selected_members")}: {selectedUsers.length}
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((userId) => {
                    const user = availableUsers.find(
                      (user) => user.id === userId
                    );
                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{user?.username}</span>
                        <button
                          onClick={() => handleUserToggle(userId)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <IoRemove size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Member Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t("group_modal.add_members")}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                placeholder={t("group_modal.search_users")}
              />
              <div className="max-h-40 overflow-y-auto scrollbar-hide border border-gray-300 rounded-md">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center justify-between p-3 hover:bg-[#3c3f44] cursor-pointer",
                      selectedUsers.includes(user.id) ? "bg-[#3c3d3d]" : ""
                    )}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getFirstLetterCapitalized(user.username)}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    {selectedUsers.includes(user.id) ? (
                      <IoRemove className="text-blue-500" size={20} />
                    ) : (
                      <IoAdd className="text-gray-400" size={20} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={closeButton}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-[#3c3f44] cursor-pointer"
              >
                {t("group_modal.cancel")}
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={
                  !groupName.trim() || selectedUsers.length === 0 || loading
                }
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2  cursor-pointer"
              >
                {loading ? (
                  t("group_modal.creating")
                ) : (
                  <>
                    <IoPeople size={20} />
                    {t("group_modal.create")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
