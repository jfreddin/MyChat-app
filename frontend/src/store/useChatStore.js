import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./authStore";
import { useNotificationStore } from "./useNotificationStore";

const isOnChatsPage = () => window.location.pathname === "/chats";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  friends: [],
  suggestedSearch: [],
  searchedUsers: [],
  requestsSent: [],
  requestsInbox: [],
  selectedUser: null,
  isUsersLoading: false,
  isFriendsLoading: false,
  isSuggestedSearchLoading: false,
  isSearchedUsersLoading: false,
  isRequestsSentLoading: false,
  isRequestsInboxLoading: false,
  isMessagesLoading: false,
  requestsIgnored: [],
  isRequestsIgnoredLoading: false,
  profileUserFriends: [],
  isProfileUserFriendsLoading: false,
  unreadMessages: {}, // { userId: true/false }
  typingUsers: {}, // { userId: true/false }

  clearUnread: (userId) => {
    set((state) => ({
      unreadMessages: { ...state.unreadMessages, [userId]: false },
    }));
  },

  emitTyping: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.emit("typing", { receiverId });
  },

  emitStopTyping: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.emit("stopTyping", { receiverId });
  },

  getProfileUserFriends: async (userId) => {
    set({ isProfileUserFriendsLoading: true });
    try {
      const res = await axiosInstance.get(`/auth/user/${userId}/friends`);
      set({ profileUserFriends: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isProfileUserFriendsLoading: false });
    }
  },

  getRequestsIgnored: async () => {
    set({ isRequestsIgnoredLoading: true });
    try {
      const res = await axiosInstance.get("/auth/friends/ignored");
      set({ requestsIgnored: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isRequestsIgnoredLoading: false });
    }
  },

  ignoreFriendRequest: async (userId) => {
    try {
      await axiosInstance.put(`/auth/friends/ignore/${userId}`);
      const ignored = get().requestsInbox.find((u) => u._id === userId);
      set({
        requestsInbox: get().requestsInbox.filter((u) => u._id !== userId),
        requestsIgnored: [...get().requestsIgnored, ignored],
      });
      toast.success("Request ignored");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  getFriendsForSidebar: async () => {
    set({ isFriendsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users/sidebar"); // Adjust route if needed

      // Sort the array: Newest timestamps move to the top (index 0)
      const sortedFriends = res.data.sort((a, b) => {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });

      set({ friends: sortedFriends });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isFriendsLoading: false });
    }
  },

  getFriends: async () => {
    set({ isFriendsLoading: true });
    try {
      const res = await axiosInstance.get("/auth/friends");
      set({ friends: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isFriendsLoading: false });
    }
  },

  getRequestsInbox: async () => {
    set({ isRequestsInboxLoading: true });
    try {
      const res = await axiosInstance.get("/auth/friends/inbox");
      set({ requestsInbox: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isRequestsInboxLoading: false });
    }
  },

  getRequestsSent: async () => {
    set({ isRequestsSentLoading: true });
    try {
      const res = await axiosInstance.get("/auth/friends/sent");
      set({ requestsSent: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isRequestsSentLoading: false });
    }
  },

  getSearchedUsers: async (query) => {
    set({ isSearchedUsersLoading: true });
    try {
      const res = await axiosInstance.get(`/search/search?query=${query}`);
      set({ searchedUsers: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSearchedUsersLoading: false });
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.put(`/auth/friends/send/${userId}`);
      // add to requestsSent locally so UI updates instantly
      set({ requestsSent: [...get().requestsSent, { _id: userId }] });
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.put(`/auth/friends/accept/${userId}`);
      // move from inbox to friends locally
      const acceptedUser = get().requestsInbox.find((u) => u._id === userId);
      set({
        friends: [...get().friends, acceptedUser],
        requestsInbox: get().requestsInbox.filter((u) => u._id !== userId),
      });
      toast.success("Friend request accepted!");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  removeFriend: async (userId) => {
    try {
      await axiosInstance.delete(`/auth/friends/remove/${userId}`);
      set({ friends: get().friends.filter((f) => f._id !== userId) });
      toast.success("Friend removed");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  getSuggestedSearch: async () => {
    set({ isSuggestedSearchLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users/all");
      set({ suggestedSearch: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSuggestedSearchLoading: false });
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });

      // NEW: Bump the person you just texted to the top
      set((state) => {
        const updatedFriends = state.friends.map((friend) => {
          if (friend._id === selectedUser._id) {
            return { ...friend, lastMessageTime: res.data.createdAt };
          }
          return friend;
        });

        updatedFriends.sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
        );
        return { friends: updatedFriends };
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    get().subscribeToGlobalMessages();
        socket.off("typing");
        socket.off("stopTyping");
        socket.off("messageEdited");  // <-- ADD THIS
        socket.off("messageDeleted"); // <-- ADD THIS

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      const { addNotification } = useNotificationStore.getState();

      if (!currentSelectedUser) {
        get().subscribeToGlobalMessages();
        return;
      }

      const isFromSelectedUser =
        newMessage.senderId === currentSelectedUser._id;

      if (isFromSelectedUser) {
        // Message is from the open chat — add it to the conversation
        set({ messages: [...get().messages, newMessage] });
      } else {
        // Message is from someone else — mark unread and notify
        const sender = get().friends.find((f) => f._id === newMessage.senderId);
        set((state) => ({
          unreadMessages: {
            ...state.unreadMessages,
            [newMessage.senderId]: true,
          },
        }));

        if (!isOnChatsPage()) {
          addNotification({
            type: "message",
            title: sender?.name || "New Message",
            message: newMessage.text || "Sent an image",
            avatar: sender?.profilePic
              ? `http://localhost:5000${sender.profilePic}`
              : null,
          });
        }
      }

      // Bump friend to top of sidebar
      set((state) => {
        const updatedFriends = state.friends.map((friend) => {
          if (
            friend._id === newMessage.senderId ||
            friend._id === newMessage.receiverId
          ) {
            return { ...friend, lastMessageTime: newMessage.createdAt };
          }
          return friend;
        });
        updatedFriends.sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
        );
        return { friends: updatedFriends };
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    get().subscribeToGlobalMessages(); 
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });

    if (selectedUser) {
      set((state) => ({
        friends: state.friends.map((friend) =>
          friend._id === selectedUser._id
            ? { ...friend, unread: false }
            : friend,
        ),
      }));
    } else {
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.off("newMessage");
        get().subscribeToGlobalMessages();
      }
    }
  },

  subscribeToGlobalMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("friendRequest");

    socket.on("typing", ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: true },
      }));
    });

    socket.on("stopTyping", ({ senderId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [senderId]: false },
      }));
    });

    socket.on("newMessage", (newMessage) => {
      const selectedUser = get().selectedUser;
      const { addNotification } = useNotificationStore.getState(); 

      if (!selectedUser || newMessage.senderId !== selectedUser._id) {
        set((state) => ({
          unreadMessages: {
            ...state.unreadMessages,
            [newMessage.senderId]: true,
          },
        }));

        const sender = get().friends.find((f) => f._id === newMessage.senderId);
        addNotification({
          type: "message",
          title: sender?.name || "New Message",
          message: newMessage.text || "Sent an image",
          avatar: sender?.profilePic
            ? `http://localhost:5000${sender.profilePic}`
            : null,
        });
      }

      set((state) => {
        const updatedFriends = state.friends.map((friend) => {
          if (
            friend._id === newMessage.senderId ||
            friend._id === newMessage.receiverId
          ) {
            return { ...friend, lastMessageTime: newMessage.createdAt };
          }
          return friend;
        });
        updatedFriends.sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
        );
        return { friends: updatedFriends };
      });
    });

    socket.on("friendRequest", (senderUser) => {
      const { addNotification } = useNotificationStore.getState(); 

      set((state) => ({
        requestsInbox: [...state.requestsInbox, senderUser],
      }));

      addNotification({
        type: "friendRequest",
        title: "New Friend Request",
        message: `${senderUser.name} sent you a friend request`,
        avatar: senderUser.profilePic
          ? `http://localhost:5000${senderUser.profilePic}`
          : null,
      });
    });

    // Restored from original
    socket.on("messageEdited", (editedMessage) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === editedMessage._id ? editedMessage : msg
        )
      }));
    });

    // Restored from original
    socket.on("messageDeleted", (deletedMessageId) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== deletedMessageId)
      }));
    });
  },

  // Restored from original
  editMessage: async (messageId, newText) => {
    try {
      const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text: newText });
      
      set((state) => ({
        messages: state.messages.map((msg) => 
          msg._id === messageId ? res.data : msg
        )
      }));
      
      toast.success("Message edited");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  // Restored from original
  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId)
      }));
      
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },
}));
