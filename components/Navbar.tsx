"use client";
import { useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase.config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import { doc, updateDoc } from "firebase/firestore";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import Image from "next/image";
import NavbarButton from "./ui/navbar-button";

const Navbar = () => {
  const { chatAppName, loginInputRef, setSelectedUser } =
    useContext(AppContext);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  const logOut = async () => {
    try {
      // active now to false
      const userRef = doc(db, "users", auth.currentUser?.uid || "");
      await updateDoc(userRef, { active: false });

      await signOut(auth);
      setSelectedUser(null);
      console.log("user logged out", user);
      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  };

  const signIn = () => {
    loginInputRef.current?.focus();
  };

  useEffect(() => {
    const getUser = onAuthStateChanged(auth, (curuser) => setUser(curuser));

    return () => getUser();
  }, []);

  return (
    <nav className="shadow-sm bg-white">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
        {/* Logo/Brand */}
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-blue-500">
          <IoChatboxEllipsesOutline className="size-4 sm:size-5" />
          {chatAppName}
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
                <Image
                  className="rounded-full border-2 border-gray-100 cursor-pointer"
                  src={"/assests/avatar.webp"}
                  alt="Profile"
                  width={40}
                  height={40}
                />
              </div>
            </div>
          )}

          {/* Login || logout Buttons */}
          <NavbarButton
            isLoggedIn={user ? true : false}
            onClick={user ? logOut : signIn}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
