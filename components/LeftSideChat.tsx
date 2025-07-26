"use client";
import { auth, db } from "@/app/firebase/config";
import { AppContext } from "@/context/Context";
import { collection, getDocs } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
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
  return (
    <div className="bg-[#14b8a6] text-white border-r-2 border-gray-100">
      <div className="flex justify-between items-center p-6 gap-2">
        <h1 className="text-2xl font-semibold">ChatApp</h1>
        <p className="cursor-pointer">
          <HiDotsVertical />
        </p>
      </div>
      <div className="flex items-center gap-2 bg-[#0f766e] rounded-md px-3 py-2 mx-5 mb-4">
        <FaSearch className="text-white text-sm" />
        <input
          type="text"
          onChange={change}
          value={searchInput}
          placeholder="Search here.."
          className="bg-transparent text-white placeholder-white outline-none w-full"
        />
      </div>
      {/* users list */}
      <div className="max-h-[450px] overflow-y-scroll scrollbar-hide">
        {usersList
          .filter((user) => user.id !== auth.currentUser?.uid)
          .map((user, index) => (
            <div
              onClick={() => setSelectedUser(user)}
              key={index}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1A4FA3] cursor-pointer ${
                selectedUser?.id === user.id ? "bg-[#1A4FA3]" : ""
              }`}
            >
              <img
                src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
                alt="avatar"
                className="size-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-gray-300">{user.email}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default LeftSideChat;
