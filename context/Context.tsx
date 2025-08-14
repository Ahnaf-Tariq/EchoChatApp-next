"use client";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createContext, useRef, useState } from "react";

export const AppContext = createContext<any>(null);

interface User {
  id: string;
  username: string;
  email: string;
  lastSeen: number;
}

export const Context = ({ children }: any) => {
  const [image, setImage] = useState<File>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const loginInputRef = useRef(null)

  const LoadUserData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userInfo = userSnap.data();
      console.log(userInfo);

      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      setInterval(async () => {
        if (auth) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000); // update user's last seen after every 1 minute
    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    image,
    setImage,
    LoadUserData,
    selectedUser,
    setSelectedUser,
    loginInputRef
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// {/* <div className="bg-[#14b8a6] text-white border-r-2 border-gray-100">
//       <div className="flex justify-between items-center p-6 gap-2">
//         <h1 className="text-2xl font-semibold">ChatApp</h1>
//         <p className="cursor-pointer">
//           <HiDotsVertical />
//         </p>
//       </div>
//       <div className="flex items-center gap-2 bg-[#0f766e] rounded-md px-3 py-2 mx-5 mb-4">
//         <FaSearch className="text-white text-sm" />
//         <input
//           type="text"
//           onChange={change}
//           value={searchInput}
//           placeholder="Search here.."
//           className="bg-transparent text-white placeholder-white outline-none w-full"
//         />
//       </div>
//       {/* users list */}
//       <div className="max-h-[450px] overflow-y-scroll scrollbar-hide">
//         {usersList
//           .filter((user) => user.id !== auth.currentUser?.uid)
//           .map((user, index) => (
//             <div
//               onClick={() => setSelectedUser(user)}
//               key={index}
//               className={`flex items-center gap-3 px-4 py-3 hover:bg-[#1A4FA3] cursor-pointer ${
//                 selectedUser?.id === user.id ? "bg-[#1A4FA3]" : ""
//               }`}
//             >
//               <img
//                 src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
//                 alt="avatar"
//                 className="size-10 rounded-full"
//               />
//               <div>
//                 <p className="font-semibold">{user.username}</p>
//                 <p className="text-sm text-gray-300">{user.email}</p>
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>




// // **************************************************************************




// <div className="bg-[#14b8a6] text-white relative">
//       {/* user info */}
//       <div className="flex justify-between items-center p-4 border-b-2 border-gray-300 mx-2">
//         <div className="flex items-center gap-3">
//           <img
//             className="size-8 rounded-full"
//             src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-unknown-social-media-user-photo-default-avatar-profile-icon-vector-unknown-social-media-user-184816085.jpg"
//             alt=""
//           />
//           <div>
//             <h1 className="text-lg font-semibold capitalize">
//               {selectedUser?.username ? selectedUser?.username : "Select User"}
//             </h1>
//             <p className="text-xs">
//               Last Seen:{" "}
//               {selectedUser?.lastSeen
//                 ? formatDistanceToNow(new Date(selectedUser.lastSeen), {
//                     addSuffix: true,
//                   })
//                 : "N/A"}
//             </p>
//           </div>
//           {/* <p className="bg-yellow-400 rounded-full w-3 h-3"></p> */}
//         </div>
//         <BsExclamationCircle className="size-6 cursor-pointer" />
//       </div>
      
//       {/* chats msgs */}
//       {selectedUser ? (
//         <div className="max-h-[450px] overflow-y-scroll scrollbar-hide">
//           {messages.map((msg, ind) => (
//             <div
//               key={ind}
//               className={`bg-[#0f766e] p-2 m-2 w-44 rounded-lg flex flex-col gap-1 ${
//                 msg.senderId === auth.currentUser?.uid
//                   ? "ml-auto rounded-br-none"
//                   : "rounded-bl-none"
//               }`}
//             >
//               <h1>{msg.text}</h1>
//               <p
//                 className={`${
//                   msg.receiverId === selectedUser?.id
//                     ? "self-end"
//                     : "self-start"
//                 } text-sm text-gray-200`}
//               >
//                 {new Date(msg.timestamp).toLocaleTimeString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="flex flex-col justify-center items-center mt-32">
//           <h1 className="text-2xl">No User Selected</h1>
//           <p className="text-xl">Please select any user to chat!</p>
//         </div>
//       )}
      
//       {/* input msg */}
//       <div className="absolute bottom-0 w-full flex items-center gap-2 bg-[#0f766e] p-4">
//         <input
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           type="text"
//           placeholder="Search here.."
//           className="text-white placeholder-white outline-none w-full"
//         />
//         <p onClick={sendMessage} className="cursor-pointer">
//           <IoSend className="size-6" />
//         </p>
//       </div>
//     </div> */}
