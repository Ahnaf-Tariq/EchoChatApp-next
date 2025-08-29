"use client";
import { useEffect, useState } from "react";
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

export const useGroupChat = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all groups current user is a member of
  useEffect(() => {
    if (!auth.currentUser) return;

    const groupsRef = collection(db, "groups");
    const unsubscribe = onSnapshot(groupsRef, async (snapshot) => {
      const groupsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Group[];

      // Filter groups where current user is a member
      const userGroups = groupsData.filter((g) =>
        g.members.includes(auth.currentUser!.uid)
      );

      // Fetch member details for each group
      const groupsWithMembers = await Promise.all(
        userGroups.map(async (group) => {
          try {
            const memberDetails: User[] = [];
            for (const memberId of group.members) {
              const userDoc = await getDoc(doc(db, "users", memberId));
              if (userDoc.exists()) {
                memberDetails.push({
                  id: userDoc.id,
                  ...userDoc.data(),
                } as User);
              }
            }
            return { ...group, memberDetails };
          } catch (error) {
            console.error("Error fetching member details:", error);
            return group;
          }
        })
      );

      setGroups(groupsWithMembers);
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
  const createGroup = async (
    name: string,
    description: string,
    memberIds: string[]
  ) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    setLoading(true);
    try {
      const newGroupRef = doc(collection(db, "groups"));
      const groupData = {
        id: newGroupRef.id,
        name,
        description,
        members: arrayUnion(auth.currentUser.uid, ...memberIds),
        createdBy: auth.currentUser.uid,
        createdAt: Date.now(),
        lastMessage: "",
        lastMessageTime: Date.now(),
      };

      await setDoc(newGroupRef, groupData);

      // Create initial group info document
      await setDoc(
        doc(db, "groups", newGroupRef.id, "info", "details"),
        groupData
      );

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

      // Update group's last message
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        lastMessage: text,
        lastMessageTime: Date.now(),
      });
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
  };
};
