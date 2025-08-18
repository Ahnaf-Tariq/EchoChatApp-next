"use client";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../app/firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import { MdOutlineLogin } from "react-icons/md";
import { BiLogOut } from "react-icons/bi";

const Navbar = () => {
  const { loginInputRef, setSelectedUser } = useContext(AppContext);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const logOut = async () => {
    try {
      await signOut(auth);
      setSelectedUser(null);
      console.log("user logged out", user);
      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getUser = onAuthStateChanged(auth, (curuser) => setUser(curuser));

    return () => getUser();
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
        {/* Logo/Brand */}
        <h1 className="text-gray-800 text-xl sm:text-2xl font-bold tracking-tight">
          ChatApp
        </h1>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              {/* User email */}
              <div className="hidden sm:block">
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              {/* Profile Picture */}
              <div className="">
                <img
                  className="w-10 h-10 rounded-full border-2 border-gray-100 cursor-pointer"
                  src={"/assests/avatar.webp"}
                  alt="Profile"
                />
              </div>
            </div>
          )}

          {/* Login || logout Buttons */}
          {user ? (
            <button
              onClick={logOut}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm focus:outline-none cursor-pointer"
            >
              <BiLogOut className="text-lg sm:text-base" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => loginInputRef.current.focus()}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200 hover:shadow-sm cursor-pointer"
            >
              <MdOutlineLogin className="text-lg sm:text-base" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
