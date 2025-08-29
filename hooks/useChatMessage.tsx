import { auth, db } from "@/lib/firebase.config";
import { useChat } from "@/context/ChatContext";
import { uploadCloudinaryImage } from "@/lib/cloudinary/cloudinaryImage";
import { uploadCloudinaryVoice } from "@/lib/cloudinary/cloudinaryVoice";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Message } from "@/types/interfaces";

const useChatMessage = () => {
  const { selectedUser } = useChat();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const msgSendInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // scroll to bottom function
  const scrollToBottom = () => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  // get all chats
  useEffect(() => {
    if (!auth.currentUser || !selectedUser) return;

    const currentUserId = auth.currentUser.uid;
    const receiverId = selectedUser.id;
    const chatId =
      currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`;

    const chatRef = doc(db, "chats", chatId);

    const unsub = onSnapshot(chatRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().chatData || [];
        setMessages(data);

        // Mark messages as seen
        let updated = false;
        const updatedMessages = data.map((message: Message) => {
          if (message.receiverId === currentUserId && !message.hasUserSeen) {
            updated = true;
            return { ...message, hasUserSeen: true };
          }
          return message;
        });

        if (updated) {
          await updateDoc(chatRef, { chatData: updatedMessages });
        }
      } else {
        setMessages([]);
      }
    });

    return () => unsub();
  }, [selectedUser]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      alert("Could not access microphone");
      console.error("Microphone access error:", error);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!selectedUser) throw new Error("No selected user");

    setUploading(true);

    try {
      const audioUrl = await uploadCloudinaryVoice(audioBlob);

      if (audioUrl) {
        const currentUserId = auth.currentUser.uid;
        const receiverId = selectedUser.id;
        const chatId =
          currentUserId < receiverId
            ? `${currentUserId}_${receiverId}`
            : `${receiverId}_${currentUserId}`;

        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        const audioMessage: Message = {
          senderId: currentUserId,
          receiverId,
          audioUrl,
          type: "audio",
          timestamp: Date.now(),
          hasUserSeen: false,
        };

        if (chatSnap.exists()) {
          await updateDoc(chatRef, {
            chatData: arrayUnion(audioMessage),
          });
        } else {
          await setDoc(chatRef, {
            chatData: [audioMessage],
          });
        }
      }
      setUploading(false);
    } catch (error) {
      console.error("Error in sending voice message:", error);
      setUploading(false);
    }
  };

  // Play/pause audio
  const toggleAudio = (audioUrl: string) => {
    try {
      if (playingAudio === audioUrl && currentAudio) {
        if (isPaused) {
          currentAudio.play();
          setIsPaused(false);
        } else {
          currentAudio.pause();
          setIsPaused(true);
        }
      } else {
        if (currentAudio) {
          currentAudio.pause();
          setCurrentAudio(null);
        }

        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setPlayingAudio(null);
          setCurrentAudio(null);
          setIsPaused(false);
        };

        audio.onpause = () => {
          setIsPaused(true);
        };

        audio.onplay = () => {
          setIsPaused(false);
        };

        audio.play();
        setPlayingAudio(audioUrl);
        setCurrentAudio(audio);
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!selectedUser) throw new Error("No selected user");

    try {
      const value = e.target.value;
      setInputMessage(value);

      const userRef = doc(db, "users", auth.currentUser.uid);

      if (value.trim() !== "") {
        await updateDoc(userRef, { typing: true, typingTo: selectedUser.id });
      } else {
        await updateDoc(userRef, { typing: false, typingTo: null });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (value.trim() !== "") {
        typingTimeoutRef.current = setTimeout(async () => {
          if (auth.currentUser) {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, { typing: false, typingTo: null });
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Error in handle typing:", error);
    }
  };

  const addEmoji = async (messageTimestamp: number, emoji: string) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!selectedUser) throw new Error("No selected user");

    try {
      const currentUserId = auth.currentUser.uid;
      const receiverId = selectedUser.id;
      const chatId =
        currentUserId < receiverId
          ? `${currentUserId}_${receiverId}`
          : `${receiverId}_${currentUserId}`;

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) return;

      const chatData = chatSnap.data().chatData as Message[];

      const targetMessage = chatData.find(
        (message) => message.timestamp === messageTimestamp
      );

      if (!targetMessage) return;

      const reactions = { ...(targetMessage.reactions || {}) };

      Object.keys(reactions).forEach((existingEmoji) => {
        reactions[existingEmoji] = reactions[existingEmoji].filter(
          (userId) => userId !== currentUserId
        );
        if (reactions[existingEmoji].length === 0) {
          delete reactions[existingEmoji];
        }
      });

      const wasAlreadyReacted =
        targetMessage.reactions?.[emoji]?.includes(currentUserId);
      if (!wasAlreadyReacted) {
        reactions[emoji] = reactions[emoji] || [];
        reactions[emoji].push(currentUserId);
      }

      const updatedMessages = chatData.map((message) =>
        message.timestamp === messageTimestamp
          ? { ...message, reactions }
          : message
      );

      await updateDoc(chatRef, { chatData: updatedMessages });
    } catch (error) {
      console.error("Error in adding Emoji:", error);
    }
  };

  const deleteEmoji = async (messageTimestamp: number, emoji: string) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!selectedUser) throw new Error("No selected user");

    try {
      const currentUserId = auth.currentUser.uid;
      const receiverId = selectedUser.id;
      const chatId =
        currentUserId < receiverId
          ? `${currentUserId}_${receiverId}`
          : `${receiverId}_${currentUserId}`;

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const chatData = chatSnap.data().chatData as Message[];

        const updatedMessages = chatData.map((message) => {
          if (message.timestamp === messageTimestamp) {
            let reactions = { ...(message.reactions || {}) };

            if (reactions[emoji]) {
              reactions[emoji] = reactions[emoji].filter(
                (uid) => uid !== currentUserId
              );

              if (reactions[emoji].length === 0) {
                delete reactions[emoji];
              }
            }

            return { ...message, reactions };
          }
          return message;
        });

        await updateDoc(chatRef, {
          chatData: updatedMessages,
        });
      }
    } catch (error) {
      console.error("Error in deleting Emoji:", error);
    }
  };

  const sendMessage = async () => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!selectedUser) throw new Error("No selected user");

    if (!inputMessage.trim()) {
      msgSendInputRef.current?.focus();
      return null;
    }

    const currentUserId = auth.currentUser.uid;
    const receiverId = selectedUser.id;
    const chatId =
      currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`;

    const newMessage: Message = {
      senderId: currentUserId,
      receiverId,
      text: inputMessage,
      type: "text",
      timestamp: Date.now(),
      hasUserSeen: false,
    };

    setInputMessage("");

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        await updateDoc(chatRef, {
          chatData: arrayUnion(newMessage),
        });
      } else {
        await setDoc(chatRef, {
          chatData: [newMessage],
        });
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { typing: false, typingTo: null });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!selectedUser) throw new Error("No selected user");

    setUploading(true);

    try {
      const imageUrl = await uploadCloudinaryImage(file);

      if (imageUrl) {
        const currentUserId = auth.currentUser.uid;
        const receiverId = selectedUser.id;
        const chatId =
          currentUserId < receiverId
            ? `${currentUserId}_${receiverId}`
            : `${receiverId}_${currentUserId}`;

        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        const imageMessage: Message = {
          senderId: currentUserId,
          receiverId,
          imageUrl,
          type: "image",
          timestamp: Date.now(),
          hasUserSeen: false,
        };

        if (chatSnap.exists()) {
          await updateDoc(chatRef, {
            chatData: arrayUnion(imageMessage),
          });
        } else {
          await setDoc(chatRef, {
            chatData: [imageMessage],
          });
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const deleteMessage = async (timestamp: number) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!selectedUser) throw new Error("No selected user");

    try {
      const currentUserId = auth.currentUser.uid;
      const receiverId = selectedUser.id;
      const chatId =
        currentUserId < receiverId
          ? `${currentUserId}_${receiverId}`
          : `${receiverId}_${currentUserId}`;

      const chatRef = doc(db, "chats", chatId);
      const messageToDelete = messages.find(
        (message) => message.timestamp === timestamp
      );

      if (messageToDelete) {
        await updateDoc(chatRef, {
          chatData: arrayRemove(messageToDelete),
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return {
    inputMessage,
    setInputMessage,
    messages,
    uploading,
    isRecording,
    playingAudio,
    isPaused,
    msgSendInputRef,
    fileInputRef,
    chatScrollRef,
    handleTyping,
    sendMessage,
    handleImageUpload,
    startRecording,
    stopRecording,
    toggleAudio,
    deleteMessage,
    addEmoji,
    deleteEmoji,
  };
};

export default useChatMessage;
