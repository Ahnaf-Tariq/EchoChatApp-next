import { auth, db } from "@/lib/firebase.config";
import { useChat } from "@/context/ChatContext";
import { UploadCloudinaryImage } from "@/lib/cloudinary/cloudinaryImage";
import { UploadCloudinaryVoice } from "@/lib/cloudinary/cloudinaryVoice";
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
    if (!selectedUser || !auth.currentUser) return;

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
    if (!selectedUser || !auth.currentUser) return;

    setUploading(true);

    try {
      const audioUrl = await UploadCloudinaryVoice(audioBlob);

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
    try {
      const value = e.target.value;
      setInputMessage(value);

      if (!auth.currentUser || !selectedUser) return;

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
    if (!selectedUser || !auth.currentUser) return;

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

            Object.keys(reactions).forEach((existingEmoji) => {
              const userIndex = reactions[existingEmoji].indexOf(currentUserId);
              if (userIndex > -1) {
                reactions[existingEmoji].splice(userIndex, 1);

                if (reactions[existingEmoji].length === 0) {
                  delete reactions[existingEmoji];
                }
              }
            });

            const wasAlreadyReacted =
              message.reactions?.[emoji]?.includes(currentUserId);

            if (!wasAlreadyReacted) {
              if (!reactions[emoji]) {
                reactions[emoji] = [];
              }
              reactions[emoji].push(currentUserId);
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
      console.error("Error in adding Emoji:", error);
    }
  };

  const deleteEmoji = async (messageTimestamp: number, emoji: string) => {
    if (!selectedUser || !auth.currentUser) return;

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
    if (!file || !auth.currentUser || !selectedUser) return;

    setUploading(true);

    try {
      const imageUrl = await UploadCloudinaryImage(file);

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
    if (!selectedUser || !auth.currentUser) return;

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
