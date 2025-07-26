"use client";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../app/firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";

const Navbar = () => {
  const {image} = useContext(AppContext)
  const [user, setUser] = useState<any>(null);
  const router = useRouter()

  const logOut = async () => {
    try {
      await signOut(auth);
      console.log("user logged out",user);
      router.replace('/')
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getUser = onAuthStateChanged(auth, (curuser) => setUser(curuser));

    return () => getUser()
  }, []);

  return (
    <div className="bg-[#14b8a6]">
      <div className="flex justify-between items-center max-w-7xl mx-auto p-4">
        <h1 className="text-white text-2xl sm:text-3xl font-semibold">
          Chat App
        </h1>
        <div className="flex gap-3 items-center">
          {user && (
            <img
              className="size-12 rounded-full cursor-pointer"
              src={image ? URL.createObjectURL(image) : user.photoURL ? user.photoURL : 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg'}
              alt="user Profile"
            />
          )}
          <button
            onClick={logOut}
            className="text-white font-semibold bg-[#0f766e] rounded-xl px-2 sm:px-4 py-1 sm:py-2 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
