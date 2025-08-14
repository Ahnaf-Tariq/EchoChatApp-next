"use client";
import { auth, db } from "@/app/firebase/config";
import { AppContext } from "@/context/Context";
import { collection, getDocs } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";

interface User {
  id: string;
  username: string;
  email: string;
  lastSeen: number;
}

const LeftSideChat = () => {
  const { selectedUser, setSelectedUser } = useContext(AppContext);
  const [searchInput, setSearchInput] = useState("");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [originalUsersList, setOriginalUsersList] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userRef = collection(db, "users");
      const snap = await getDocs(userRef);

      const users: User[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      console.log(users);
      setUsersList(users);
      setOriginalUsersList(users);
    };
    fetchUsers();
  }, []);

  const change = (e: any) => {
    const value = e.target.value;
    setSearchInput(value);

    const filtered = originalUsersList.filter((item) =>
      item.username.toLowerCase().includes(value.toLowerCase())
    );

    setUsersList(filtered);
  };
  // LeftSideChat.tsx
  return (
    <div className="bg-white text-black border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">ChatApp</h1>
        <HiDotsVertical className="cursor-pointer text-gray-500 hover:text-gray-700" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 m-3">
        <FaSearch className="text-gray-400 text-sm" />
        <input
          type="text"
          onChange={change}
          value={searchInput}
          placeholder="Search..."
          className="bg-transparent text-gray-700 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Users List */}
      <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
        {usersList
          .filter((user) => user.id !== auth.currentUser?.uid)
          .map((user) => (
            <div
              onClick={() => setSelectedUser(user)}
              key={user.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                selectedUser?.id === user.id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <img
                src="/assests/avatar.webp"
                alt="avatar"
                className="size-10 rounded-full border border-gray-300"
              />
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default LeftSideChat;
