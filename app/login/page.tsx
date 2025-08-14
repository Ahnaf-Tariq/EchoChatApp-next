"use client";
import { useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, provider } from "../firebase/config";
import { useRouter } from "next/navigation";
import { AppContext } from "@/context/Context";
import { toast } from "react-toastify";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const { image, setImage, loginInputRef } = useContext(AppContext);
  const [currentState, setCurrentState] = useState<string>("Sign In");
  const [email, setEmail] = useState<string>("");
  const [isEmailFocused, setIsEmailFocused] = useState<Boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [isPasswordFocused, setIsPasswordFocused] = useState<Boolean>(false);
  const [name, setName] = useState<any>(null);
  const [isNameFocused, setIsNameFocused] = useState<Boolean>(false);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (curuser) => {
      if (curuser) {
        router.push("/chat");
      }
    });
    // localStorage.setItem("image", image);
  }, []);

  const handleImageChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const googleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      console.log(res.user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignIn = async () => {
    try {
      if (currentState === "Sign In") {
        if (!email || !password) {
          toast.error("Please fill all fields");
          return;
        }
        const res = await signInWithEmailAndPassword(auth, email, password);
        console.log(res.user);
      } else {
        if (!name || !email || !password) {
          toast.error("Please fill all fields");
          return;
        } else {
          const res = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = res.user;
          console.log(user);

          await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            email,
            username: name.toLowerCase(),
            lastSeen: Date.now(),
          });
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.code);
    }
  };
  return (
    <div className="flex justify-center mt-20 items-center px-2">
      <div className="bg-white shadow-md p-6 rounded-xl w-96">
        <div className="flex justify-center">
          <h1 className="font-bold text-2xl">{currentState}</h1>
        </div>
        <hr className="text-gray-400 my-4" />

        {/* input fields */}
        <div className="flex flex-col gap-3">
          {/* photo & name field */}
          {currentState === "Sign Up" && (
            <>
              <div className="">
                <input
                  hidden
                  onChange={handleImageChange}
                  type="file"
                  id="photo"
                />
                <label
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  htmlFor="photo"
                >
                  <img
                    className="size-16 rounded-full border-2 border-gray-300 object-cover hover:scale-105 transition-transform"
                    src={
                      image
                        ? URL.createObjectURL(image)
                        : "/assests/avatar.webp"
                    }
                    alt=""
                  />
                  <span className="text-sm text-gray-500">Upload Photo</span>
                </label>
              </div>
              <div className="flex flex-col gap-1 relative">
                <input
                  type="text"
                  className={`px-2 py-2 text-base border rounded-md outline-none transition-all duration-200 ease-in-out
              ${isNameFocused ? "border-blue-500" : "border-gray-400"}
            `}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  id="name"
                  required
                />
                <label
                  htmlFor="name"
                  className={`absolute left-3 transition-all duration-200 ease-in-out pointer-events-none
              ${
                isNameFocused || name
                  ? "text-xs -top-2 px-1 bg-white"
                  : "text-base top-2"
              }
              ${isNameFocused ? "text-blue-500" : "text-gray-400"}
            `}
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
              className={`px-2 py-2 text-base border rounded-md outline-none transition-all duration-200 ease-in-out
              ${isEmailFocused ? "border-blue-500" : "border-gray-400"}
            `}
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
              className={`absolute left-3 transition-all duration-200 ease-in-out pointer-events-none
              ${
                isEmailFocused || email
                  ? "text-xs -top-2 px-1 bg-white"
                  : "text-base top-2"
              }
              ${isEmailFocused ? "text-blue-500" : "text-gray-400"}
            `}
            >
              Email
            </label>
          </div>
          {/* password field */}
          <div className="flex flex-col gap-1 relative">
            <input
              type="text"
              className={`px-2 py-2 text-base border rounded-md outline-none transition-all duration-200 ease-in-out
              ${isPasswordFocused ? "border-blue-500" : "border-gray-400"}
            `}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              id="password"
              required
            />
            <label
              htmlFor="password"
              className={`absolute left-3 transition-all duration-200 ease-in-out pointer-events-none
              ${
                isPasswordFocused || password
                  ? "text-xs -top-2 px-1 bg-white"
                  : "text-base top-2"
              }
              ${isPasswordFocused ? "text-blue-500" : "text-gray-400"}
            `}
            >
              Password
            </label>
          </div>

          {/* button sign in */}
          <button
            onClick={handleSignIn}
            className="w-full font-semibold bg-blue-500 hover:bg-blue-600 hover:shadow-md text-white rounded-lg py-1 mt-2 cursor-pointer"
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
            className="w-full flex justify-center items-center gap-2 border border-[#14b8a6] rounded-lg py-2 hover:bg-gray-50 transition cursor-pointer"
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOHI2JLXYQ0StQ1vzNLvULyckAUF1uIUnoxg&s"
              className="size-5"
              alt=""
            />
            <span className="text-sm font-medium text-gray-700">
              Continue with Google
            </span>
          </button>
        </div>

        {/* logic last */}
        {currentState === "Sign In" ? (
          <p className="mt-4 text-sm">
            Don't have an account?{" "}
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
