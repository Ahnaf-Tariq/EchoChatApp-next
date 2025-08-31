"use client";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase.config";
import { Group, GroupMessage, User } from "@/types/interfaces";
import {
  addDoc,
  arrayUnion,
  arrayRemove,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { uploadCloudinaryImage } from "@/lib/cloudinary/cloudinaryImage";
import { uploadCloudinaryVoice } from "@/lib/cloudinary/cloudinaryVoice";

export const useGroupChat = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all groups current user is a member of
  useEffect(() => {
    if (!auth.currentUser) return;

    const groupsRef = collection(db, "groups");
    const unsubscribe = onSnapshot(groupsRef, async (snapshot) => {
      const groupsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Group[];

      const userGroups = groupsData.filter((group) =>
        group.members.includes(auth.currentUser!.uid)
      );

      setGroups(userGroups);
    });

    return () => unsubscribe();
  }, []);

  // Listen to messages of a specific group
  const listenMessages = (groupId: string) => {
    const msgsRef = collection(db, "groups", groupId, "messages");
    const q = query(msgsRef, orderBy("timestamp", "asc"));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as GroupMessage[];

      setMessages(data);
    });
  };

  // Create a new group
  const createGroup = async (name: string, memberIds: string[]) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    setLoading(true);
    try {
      const newGroupRef = doc(collection(db, "groups"));
      const groupData = {
        id: newGroupRef.id,
        name,
        members: arrayUnion(auth.currentUser.uid, ...memberIds),
        createdBy: auth.currentUser.uid,
        createdAt: Date.now(),
      };

      await setDoc(newGroupRef, groupData);

      return newGroupRef.id;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send message to group
  const sendMessage = async (
    groupId: string,
    text: string,
    type: "text" | "image" | "audio" = "text",
    imageUrl?: string,
    audioUrl?: string,
    taggedUsers?: string[]
  ) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
      const msgsRef = collection(db, "groups", groupId, "messages");
      const messageData = {
        groupId,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || auth.currentUser.email,
        text,
        type,
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        timestamp: Date.now(),
        reactions: {},
        taggedUsers: taggedUsers || [],
      };

      await addDoc(msgsRef, messageData);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Add member to group
  const addMemberToGroup = async (groupId: string, memberId: string) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(memberId),
      });
    } catch (error) {
      console.error("Error adding member:", error);
      throw error;
    }
  };

  // Remove member from group
  const removeMemberFromGroup = async (groupId: string, memberId: string) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(memberId),
      });
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  };

  // Leave group
  const leaveGroup = async (groupId: string) => {
    if (!auth.currentUser) return;
    await removeMemberFromGroup(groupId, auth.currentUser.uid);
  };

  // Delete group (only for group creator)
  const deleteGroup = async (groupId: string) => {
    if (!auth.currentUser) return;

    try {
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (
        groupDoc.exists() &&
        groupDoc.data().createdBy === auth.currentUser.uid
      ) {
        // Delete all messages first
        const messagesRef = collection(db, "groups", groupId, "messages");
        const messagesSnapshot = await getDocs(messagesRef);

        const deletePromises = messagesSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );

        await Promise.all(deletePromises);

        // Delete group info
        await deleteDoc(doc(db, "groups", groupId, "info", "details"));

        // Delete group
        await deleteDoc(groupRef);
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  };

  // Get users not in group for adding new members
  const getUsersNotInGroup = async (groupId: string) => {
    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (!groupDoc.exists()) return [];

      const groupData = groupDoc.data() as Group;
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      const allUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      return allUsers.filter(
        (user) =>
          !groupData.members.includes(user.id) &&
          user.id !== auth.currentUser?.uid
      );
    } catch (error) {
      console.error("Error fetching users not in group:", error);
      return [];
    }
  };

  const handleImageUpload = async (
    group: Group,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!group?.id) throw new Error("No group selected");

    setUploading(true);

    try {
      const imageUrl = await uploadCloudinaryImage(file);

      if (imageUrl) {
        const msgsRef = collection(db, "groups", group.id, "messages");
        const imageMessage = {
          groupId: group.id,
          senderId: auth.currentUser.uid,
          senderName: auth.currentUser.displayName || auth.currentUser.email,
          type: "image",
          imageUrl,
          timestamp: Date.now(),
          reactions: {},
        };

        await addDoc(msgsRef, imageMessage);

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

  const startRecording = async (group: Group) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await sendVoiceMessage(group, audioBlob);
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

  const sendVoiceMessage = async (group: Group, audioBlob: Blob) => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    if (!group?.id) throw new Error("No group selected");

    setUploading(true);

    try {
      const audioUrl = await uploadCloudinaryVoice(audioBlob);

      if (audioUrl) {
        const msgsRef = collection(db, "groups", group.id, "messages");
        const audioMessage = {
          groupId: group.id,
          senderId: auth.currentUser.uid,
          senderName: auth.currentUser.displayName || auth.currentUser.email,
          type: "audio",
          audioUrl,
          timestamp: Date.now(),
          reactions: {},
        };

        await addDoc(msgsRef, audioMessage);
      }
      setUploading(false);
    } catch (error) {
      console.error("Error in sending voice message:", error);
      setUploading(false);
    }
  };

  // play/pause audio
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

  return {
    groups,
    messages,
    loading,
    listenMessages,
    createGroup,
    sendMessage,
    addMemberToGroup,
    removeMemberFromGroup,
    leaveGroup,
    deleteGroup,
    getUsersNotInGroup,
    uploading,
    isRecording,
    playingAudio,
    isPaused,
    fileInputRef,
    handleImageUpload,
    startRecording,
    stopRecording,
    toggleAudio,
  };
};
