"use client";
import { auth, db } from "@/lib/firebase.config";
import { useChat } from "@/context/ChatContext";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { IoPeople, IoPerson } from "react-icons/io5";
import UsersList from "./users-list";
import GroupList from "../group/group-list";
import CreateGroupModal from "@/components/group/create-group-modal";
import { User } from "@/types/chat.interfaces";
import { useGroupChat } from "@/hooks/useGroupChat";
import { Group } from "@/types/group.interfaces";
import { TabType } from "@/types/enums";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useCommonTranslations } from "@/hooks/useTranslations";

const UsersDisplay = () => {
  const {
    chatAppName,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
  } = useChat();
  const { t } = useCommonTranslations();
  const [activeTab, setActiveTab] = useState<TabType>(TabType.USERS);
  const [searchInput, setSearchInput] = useState("");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [originalUsersList, setOriginalUsersList] = useState<User[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const { groups } = useGroupChat();
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    const userRef = collection(db, "users");

    const unsub = onSnapshot(userRef, (snap) => {
      const users = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsersList(users);
      setOriginalUsersList(users);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (activeTab === TabType.USERS) {
      const filtered = originalUsersList.filter((item) =>
        item.username.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setUsersList(filtered);
    }
  }, [debouncedSearch, activeTab, originalUsersList]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <>
      <div className="h-[500px] sm:h-[550px] bg-white text-black border-r border-gray-200 flex flex-col">
        <div className="flex justify-between items-center gap-1 p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-500">{chatAppName}</h1>
          <HiDotsVertical className="cursor-pointer text-gray-500 hover:text-gray-700" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab(TabType.USERS)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors",
              activeTab === TabType.USERS
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <IoPerson size={18} />
            {t("chat.users")}
          </button>
          <button
            onClick={() => setActiveTab(TabType.GROUPS)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors",
              activeTab === TabType.GROUPS
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <IoPeople size={18} />
            {t("chat.groups")}
          </button>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 m-3">
          <FaSearch className="text-gray-400 text-sm" />
          <input
            type="text"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            placeholder={
              activeTab === TabType.USERS
                ? t("chat.search_users")
                : t("chat.search_groups")
            }
            className="bg-transparent text-gray-700 placeholder-gray-400 outline-none w-full"
          />
        </div>

        {activeTab === TabType.GROUPS && (
          <div className="px-3 mb-2">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <IoPeople size={18} />
              {t("group_modal.create_group")}
            </button>
          </div>
        )}

        <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
          {activeTab === TabType.USERS ? (
            usersList
              .filter((user) => user.id !== auth.currentUser?.uid)
              .map((user) => (
                <UsersList
                  key={user.id}
                  user={user}
                  isSelected={selectedUser?.id === user.id}
                  onSelect={() => handleUserSelect(user)}
                />
              ))
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <GroupList
                key={group.id}
                group={group}
                isSelected={selectedGroup?.id === group.id}
                onSelect={handleGroupSelect}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchInput
                ? t("chat.no_groups_found")
                : t("chat.no_groups_yet")}
            </div>
          )}
        </div>
      </div>

      {showCreateGroupModal && (
        <CreateGroupModal
          showCreateGroupModal={showCreateGroupModal}
          setShowCreateGroupModal={setShowCreateGroupModal}
        />
      )}
    </>
  );
};

export default UsersDisplay;
