"use client";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import { useLogin } from "@/hooks/useLogin";
import { doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Login = () => {
  const { loginInputRef, currentState, setCurrentState } =
    useContext(AppContext);
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
    const unsubscribe = onAuthStateChanged(auth, async (curuser) => {
      if (curuser) {
        router.push("/chat");
      }

      if (curuser) {
        const userRef = doc(db, "users", curuser.uid);
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
            <>
              <div className="flex flex-col gap-1 relative">
                <input
                  type="text"
                  className={cn(
                    "px-2 py-2 text-sm sm:text-base border rounded-md outline-none transition-all duration-200 ease-in-out",
                    isNameFocused ? "border-blue-500" : "border-gray-400"
                  )}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  id="name"
                  required
                />
                <label
                  htmlFor="name"
                  className={cn(
                    "absolute left-3 transition-all duration-200 ease-in-out pointer-events-none",
                    isNameFocused || name
                      ? "text-xs -top-2 px-1 bg-white"
                      : "text-base top-2",
                    isNameFocused ? "text-blue-500" : "text-gray-400"
                  )}
                >
                  Name
                </label>
              </div>
            </>
          )}

          {/* email field */}
          <div className="flex flex-col gap-1 relative">
            <input
              type="email"
              className={cn(
                "px-2 py-2 text-sm sm:text-base border rounded-md outline-none transition-all duration-200 ease-in-out",
                isEmailFocused ? "border-blue-500" : "border-gray-400"
              )}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              id="email"
              ref={loginInputRef}
              required
            />
            <label
              htmlFor="email"
              className={cn(
                "absolute left-3 transition-all duration-200 ease-in-out pointer-events-none",
                isEmailFocused || email
                  ? "text-xs -top-2 px-1 bg-white"
                  : "text-base top-2",
                isEmailFocused ? "text-blue-500" : "text-gray-400"
              )}
            >
              Email
            </label>
          </div>
          {/* password field */}
          <div className="flex flex-col gap-1 relative">
            <input
              type="password"
              className={cn(
                "px-2 py-2 text-sm sm:text-base border rounded-md outline-none transition-all duration-200 ease-in-out",
                isPasswordFocused ? "border-blue-500" : "border-gray-400"
              )}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              id="password"
              required
            />
            <label
              htmlFor="password"
              className={cn(
                "absolute left-3 transition-all duration-200 ease-in-out pointer-events-none",
                isPasswordFocused || password
                  ? "text-xs -top-2 px-1 bg-white"
                  : "text-base top-2",
                isPasswordFocused ? "text-blue-500" : "text-gray-400"
              )}
            >
              Password
            </label>
          </div>

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
