"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase.config";
import { User } from "@/types/interfaces";
import { collection, onSnapshot } from "firebase/firestore";
import { useGroupChat } from "@/hooks/useGroupChat";
import { IoClose, IoPeople, IoAdd, IoRemove } from "react-icons/io5";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { createGroup, loading } = useGroupChat();

  useEffect(() => {
    if (!isOpen) return;

    // Fetch all users except current user
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as User))
        .filter((user) => user.id !== auth.currentUser?.uid);
      setAvailableUsers(users);
    });

    return () => unsubscribe();
  }, [isOpen]);

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
      await createGroup(groupName.trim(), description.trim(), selectedUsers);
      onClose();
      setGroupName("");
      setDescription("");
      setSelectedUsers([]);
      setSearchTerm("");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name"
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group description"
              rows={3}
              maxLength={200}
            />
          </div>

          {/* Selected Members */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = availableUsers.find((u) => u.id === userId);
                  return (
                    <div
                      key={userId}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{user?.username}</span>
                      <button
                        onClick={() => handleUserToggle(userId)}
                        className="text-blue-600 hover:text-blue-800"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members *
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              placeholder="Search users..."
            />
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedUsers.includes(user.id) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleUserToggle(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={
                !groupName.trim() || selectedUsers.length === 0 || loading
              }
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <IoPeople size={20} />
                  Create Group
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
