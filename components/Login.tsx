"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase.config";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { useLogin } from "@/hooks/useLogin";
import { doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import Input from "./ui/input";

const Login = () => {
  const { loginInputRef, currentState, setCurrentState } = useChat();
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    handleSignIn,
    googleLogin,
  } = useLogin();
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [isNameFocused, setIsNameFocused] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        router.push("/chat");
      }

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { active: true });
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center mt-10 sm:mt-14 items-center px-2">
      <div className="bg-white shadow-md p-4 sm:p-6 rounded-xl w-96 max-w-full sm:w-96">
        <div className="flex justify-center">
          <h1 className="font-bold text-xl sm:text-2xl">{currentState}</h1>
        </div>
        <hr className="text-gray-400 my-4" />

        {/* input fields */}
        <div className="flex flex-col gap-3">
          {/* name field */}
          {currentState === "Sign Up" && (
            <Input
              val={name}
              setVal={setName}
              isFocused={isNameFocused}
              setIsFocused={setIsNameFocused}
              label="Name"
              type="text"
              id="name"
            />
          )}

          {/* email field */}
          <Input
            val={email}
            setVal={setEmail}
            isFocused={isEmailFocused}
            setIsFocused={setIsEmailFocused}
            label="Email"
            type="email"
            id="email"
            inputRef={loginInputRef}
          />

          {/* password field */}
          <Input
            val={password}
            setVal={setPassword}
            isFocused={isPasswordFocused}
            setIsFocused={setIsPasswordFocused}
            label="Password"
            type="password"
            id="password"
          />

          {/* button sign in */}
          <button
            onClick={handleSignIn}
            className="w-full font-semibold text-sm sm:text-base bg-blue-500 hover:bg-blue-600 hover:shadow-md text-white rounded-lg py-1 mt-2 cursor-pointer"
          >
            {currentState}
          </button>

          <div className="flex items-center my-1">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-700">Or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          {/* Google logo button */}
          <button
            onClick={googleLogin}
            className="w-full flex justify-center items-center gap-2 border border-[#14b8a6] rounded-lg py-1 sm:py-2 hover:bg-gray-50 transition cursor-pointer"
          >
            <Image
              src={"/assests/google_img.jpeg"}
              width={20}
              height={20}
              alt=""
            />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Continue with Google
            </span>
          </button>
        </div>

        {/* logic last */}
        {currentState === "Sign In" ? (
          <p className="mt-4 text-sm">
            Dont have an account?{" "}
            <span
              onClick={() => setCurrentState("Sign Up")}
              className="text-blue-500 font-semibold hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        ) : (
          <p className="mt-4 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => setCurrentState("Sign In")}
              className="text-blue-500 hover:underline font-semibold cursor-pointer"
            >
              Sign In
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
