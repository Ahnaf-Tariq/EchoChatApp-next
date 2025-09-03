"use client";
import { auth, db } from "@/lib/firebase.config";
import { useChat } from "@/context/ChatContext";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { IoLogOutOutline, IoPeople, IoPerson } from "react-icons/io5";
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
import { signOut } from "firebase/auth";
import { Routes } from "@/routes/Routes";
import { useRouter } from "next/navigation";

const UsersDisplay = () => {
  const {
    chatAppName,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    getFirstLetterCapitalized,
  } = useChat();
  const { t } = useCommonTranslations();
  const { activeTab, setActiveTab } = useChat();
  const [searchInput, setSearchInput] = useState("");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [originalUsersList, setOriginalUsersList] = useState<User[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const { groups } = useGroupChat();
  const router = useRouter();
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

  const logOut = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser?.uid || "");
      await updateDoc(userRef, { active: false });

      await signOut(auth);
      router.replace(Routes.login);
      setSelectedUser(null);
      setSelectedGroup(null);
      setActiveTab(TabType.USERS);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <div className="min-h-[550px] bg-[#2f3136] text-white border-r border-[#4f545c] flex flex-col">
        {/* Discord-like header */}
        <div className="flex justify-between items-center gap-1 p-4 border-b border-[#4f545c] bg-[#202225]">
          <h1 className="text-lg font-semibold text-[#5865f2] truncate">
            {chatAppName}
          </h1>
          <HiDotsVertical className="cursor-pointer text-[#b9bbbe] hover:text-white transition-colors" />
        </div>

        {/* Discord-like tabs */}
        <div className="flex border-b border-[#4f545c] bg-[#36393f]">
          <button
            onClick={() => setActiveTab(TabType.USERS)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors text-sm font-medium cursor-pointer",
              activeTab === TabType.USERS
                ? "text-white bg-[#2f3136] border-b-2 border-[#5865f2]"
                : "text-[#b9bbbe] hover:text-white hover:bg-[#3c3f44]"
            )}
          >
            <IoPerson size={16} />
            {t("chat.users")}
          </button>
          <button
            onClick={() => setActiveTab(TabType.GROUPS)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors text-sm font-medium cursor-pointer",
              activeTab === TabType.GROUPS
                ? "text-white bg-[#2f3136] border-b-2 border-[#5865f2]"
                : "text-[#b9bbbe] hover:text-white hover:bg-[#3c3f44]"
            )}
          >
            <IoPeople size={16} />
            {t("chat.groups")}
          </button>
        </div>

        {/* Discord-like search */}
        <div className="p-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#72767d] text-sm" />
            <input
              type="text"
              onChange={(e) => setSearchInput(e.target.value)}
              value={searchInput}
              placeholder={
                activeTab === TabType.USERS
                  ? t("chat.search_users")
                  : t("chat.search_groups")
              }
              className="w-full bg-[#202225] text-white placeholder-[#72767d] pl-9 pr-3 py-2 rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-[#5865f2] text-sm"
            />
          </div>
        </div>

        {/* Create group button */}
        {activeTab === TabType.GROUPS && (
          <div className="px-3 mb-2">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm font-medium"
            >
              <IoPeople size={16} />
              {t("group_modal.create_group")}
            </button>
          </div>
        )}

        {/* Discord-like scrollable list */}
        <div className="flex-1 overflow-y-auto discord-scrollbar">
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
            <div className="p-4 text-center text-[#72767d] text-sm">
              {searchInput
                ? t("chat.no_groups_found")
                : t("chat.no_groups_yet")}
            </div>
          )}
        </div>

        {/* Current user section (Discord-like bottom bar) */}
        {auth.currentUser && (
          <div className="p-3 border-t border-[#4f545c] bg-[#292b2f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-[#5865f2] text-white">
                  {getFirstLetterCapitalized(
                    auth.currentUser.displayName ||
                      auth.currentUser.email?.split("@")[0] ||
                      ""
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3ba55c] rounded-full border-2 border-[#2f3136]"></div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-white truncate">
                  {auth.currentUser.displayName ||
                    auth.currentUser.email?.split("@")[0]}
                </span>
                <span className="text-xs text-[#72767d]">
                  #{auth.currentUser.uid.slice(0, 6)}...
                </span>
              </div>
            </div>
            <button
              onClick={logOut}
              className="p-2 rounded-md hover:bg-[#3c3f44] text-[#b9bbbe] hover:text-white cursor-pointer"
            >
              <IoLogOutOutline />
            </button>
          </div>
        )}
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
