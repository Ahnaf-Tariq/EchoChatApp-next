"use client";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../app/firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";

const Navbar = () => {
  const { image, loginInputRef } = useContext(AppContext);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const logOut = async () => {
    try {
      await signOut(auth);
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
    <div className="bg-teal-500 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto p-4">
        <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-wide">
          Chat App
        </h1>
        <div className="flex gap-4 items-center">
          {user && (
            <img
              className="size-12 rounded-full cursor-pointer border-2 border-white shadow-sm hover:scale-105 transition-transform duration-200"
              src={
                image
                  ? URL.createObjectURL(image)
                  : user.photoURL ||
                    "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
              }
              alt="user Profile"
            />
          )}
          {user ? (
            <button
              onClick={logOut}
              className="text-white font-medium bg-teal-700 hover:bg-teal-800 rounded-lg px-4 py-2 shadow cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <p
              onClick={() => loginInputRef.current.focus()}
              className="text-white text-sm sm:text-base font-semibold cursor-pointer underline hover:text-gray-200"
            >
              Click here to Login
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
