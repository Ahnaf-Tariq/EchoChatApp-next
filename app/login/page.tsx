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
  const { image, setImage } = useContext(AppContext);
  const [currentState, setCurrentState] = useState<string>("Sign In");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (curuser) => {
      if (curuser) {
        router.push("/chat");
      }
    });
    localStorage.setItem("image", image);
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
          const res = await createUserWithEmailAndPassword(auth,email,password);
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
          <h1 className="font-semibold text-xl">{currentState}</h1>
        </div>
        <hr className="text-gray-400 my-4" />
        <div className="flex flex-col gap-3">
          {currentState === "Sign Up" && (
            <>
              <div className="flex flex-col gap-1">
                <input
                  className="border border-gray-400 rounded-md px-1"
                  // value={name}
                  hidden
                  onChange={handleImageChange}
                  type="file"
                  id="photo"
                />
                <label className="text-gray-400 font-bold" htmlFor="photo">
                  <img
                    className="size-10 mb-1"
                    src={
                      image ? URL.createObjectURL(image) : "/assests/file.svg"
                    }
                    alt=""
                  />
                  Photo
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="name">Email</label>
                <input
                  className="border border-gray-400 rounded-md px-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Name..."
                  id="name"
                  required
                />
              </div>
            </>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <input
              className="border border-gray-400 rounded-md px-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email..."
              id="email"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <input
              className="border border-gray-400 rounded-md px-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password..."
              id="password"
              required
            />
          </div>
          <button
            onClick={handleSignIn}
            className="w-full font-semibold bg-[#14b8a6] text-white rounded-lg py-1 mt-2 cursor-pointer"
          >
            {currentState}
          </button>
          {/* </div> */}
          <div className="flex items-center my-1">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-700">Or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
          <button
            onClick={googleLogin}
            className="w-full border border-[#14b8a6] text-xl rounded-lg cursor-pointer flex justify-center"
          >
            {/* Google logo */}
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOHI2JLXYQ0StQ1vzNLvULyckAUF1uIUnoxg&s"
              className="size-7"
              alt=""
            />
          </button>
        </div>
        {currentState === "Sign In" ? (
          <p
            className="mt-4 text-lg"
            onClick={() => setCurrentState("Sign Up")}
          >
            or dont have an account{" "}
            <span className="text-[#14b8a6] text-base font-semibold cursor-pointer">
              Sign Up
            </span>
          </p>
        ) : (
          <p
            className="mt-4 text-lg"
            onClick={() => setCurrentState("Sign In")}
          >
            back to{" "}
            <span className="text-[#14b8a6] text-base font-semibold cursor-pointer">
              Sign In
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
