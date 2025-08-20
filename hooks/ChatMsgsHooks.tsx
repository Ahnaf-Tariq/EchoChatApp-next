import { auth, db } from "@/app/firebase/config";
import { AppContext } from "@/context/Context";
import { uploadImageCloudinary } from "@/lib/imageCloudinary";
import { uploadVoiceCloudinary } from "@/lib/voiceCloudinary";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";

interface Message {
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  type: "text" | "image" | "audio";
  timestamp: number;
}

export const useChatMsgs = () => {
  const { selectedUser, setSelectedUser } = useContext(AppContext);
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
    if (!selectedUser || !auth.currentUser) return;

    const currentUserId = auth.currentUser.uid;
    const receiverId = selectedUser.id;
    const chatId =
      currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`;

    const chatRef = doc(db, "chats", chatId);

    const unsub = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().chatData || []);
      } else {
        setMessages([]);
      }
    });

    return () => unsub();
  }, [selectedUser]);

  // Start voice recording
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
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Send voice message
  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!selectedUser || !auth.currentUser) return;

    setUploading(true);

    try {
      const audioUrl = await uploadVoiceCloudinary(audioBlob);

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
      console.error("Voice message error:", error);
    }
  };

  // Play/pause audio
  const toggleAudio = (audioUrl: string) => {
    if (playingAudio === audioUrl && currentAudio) {
      if (isPaused) {
        // Resume the paused audio
        currentAudio.play();
        setIsPaused(false);
      } else {
        // Pause the playing audio
        currentAudio.pause();
        setIsPaused(true);
      }
    } else {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }

      // Play new audio
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
  };

  // handle input typing
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);

    if (value.trim() !== "") {
      await updateDoc(userRef, { typing: true, typingTo: selectedUser.id });
    } else {
      await updateDoc(userRef, { typing: false, typingTo: null });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Settimeout to stop typing after 3 seconds of inactivity
    if (value.trim() !== "") {
      typingTimeoutRef.current = setTimeout(async () => {
        if (auth.currentUser) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, { typing: false, typingTo: null });
        }
      }, 3000);
    }
  };

  // send message function
  const sendMessage = async () => {
    if (!selectedUser || !auth.currentUser) return;

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

    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    const newMsg: Message = {
      senderId: currentUserId,
      receiverId,
      text: inputMessage,
      type: "text",
      timestamp: Date.now(),
    };

    if (chatSnap.exists()) {
      await updateDoc(chatRef, {
        chatData: arrayUnion(newMsg),
      });
    } else {
      await setDoc(chatRef, {
        chatData: [newMsg],
      });
    }

    setInputMessage("");
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { typing: false, typingTo: null });
  };

  // image upload function
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser || !selectedUser) return;

    setUploading(true);

    try {
      const imageUrl = await uploadImageCloudinary(file);

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

  // delete message function
  const deleteMsg = async (timestamp: number) => {
    try {
      if (!selectedUser || !auth.currentUser) return;

      const currentUserId = auth.currentUser.uid;
      const receiverId = selectedUser.id;
      const chatId =
        currentUserId < receiverId
          ? `${currentUserId}_${receiverId}`
          : `${receiverId}_${currentUserId}`;

      const chatRef = doc(db, "chats", chatId);
      const msgToDelete = messages.find((msg) => msg.timestamp === timestamp);

      if (msgToDelete) {
        await updateDoc(chatRef, {
          chatData: arrayRemove(msgToDelete),
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
    deleteMsg,
  };
};
