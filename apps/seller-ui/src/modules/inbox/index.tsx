'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { axiosInstance } from '@/utils/axiosInstance';
import { useChatSocket } from '@/hooks/useChatSocket';
import ChatInput from '@/shared/components/ChatInput';
import { useSeller } from '@/hooks/useSeller';
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Download, ArrowLeft } from 'lucide-react';


const getConversations = async () => {
  const { data } = await axiosInstance.get('/chatting/api/seller/conversations');
  return data.conversations;
};
const getMessages = async ({ queryKey }: any) => {
  const [_key, conversationId, cursor] = queryKey;

  const url = cursor
    ? `/chatting/api/seller/conversations/${conversationId}/messages?cursor=${cursor}`
    : `/chatting/api/seller/conversations/${conversationId}/messages`;

  const { data } = await axiosInstance.get(url);
  return data;
};

const InboxPage = () => {
  const { seller } = useSeller();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const searchParams = useSearchParams()
  const conversationIdFromUrl = searchParams.get('conversationId')
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    index: number;
  } | null>(null);

  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const router = useRouter()

  const updateConversationLastMessage = (
    conversationId: string,
    message: string
  ) => {
    queryClient.setQueryData(['conversations'], (old: any) => {
      if (!old) return old;

      const updated = old.map((chat: any) => {
        if (chat.conversationId === conversationId) {
          return {
            ...chat,
            lastMessage: message,
          };
        }

        return chat;
      });

      // move updated conversation to top
      updated.sort((a: any, b: any) => {
        if (a.conversationId === conversationId) return -1;
        if (b.conversationId === conversationId) return 1;
        return 0;
      });

      return updated;
    });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!conversationIdFromUrl) return

    setSelectedChat((prev: any) => ({
      ...prev,
      conversationId: conversationIdFromUrl,
    }))
  }, [conversationIdFromUrl])

  // 🔹 conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  });

  useEffect(() => {
    if (!conversationIdFromUrl || !conversations.length) return;

    setSelectedChat((prev: any) => {
      // prevent unnecessary resets
      if (prev?.conversationId === conversationIdFromUrl) {
        return prev;
      }

      const found = conversations.find(
        (c: any) => c.conversationId === conversationIdFromUrl
      );

      return found || prev;
    });
  }, [conversationIdFromUrl, conversations]);

  // 🔹 messages
  const { refetch } = useQuery({
    queryKey: ['messages', selectedChat?.conversationId, cursor],
    queryFn: getMessages,
    enabled: false,
  });

  // 🔥 websocket
  // const wsRef = useChatSocket(seller?.id, (data) => {
  //   if (data.type === 'NEW_MESSAGE') {
  //     const msg = data.data;

  //     setMessages((prev) => {
  //       const existingIndex = prev.findIndex(
  //         (m) => m.tempId === msg.tempId
  //       );
  //       // replace optimistic message
  //       if (existingIndex !== -1) {
  //         const updated = [...prev];

  //         updated[existingIndex] = {
  //           ...msg,
  //           pending: false,
  //         };
  //         console.log("updated", updated);
  //         return updated;
  //       }

  //       return [...prev, msg];
  //     });
  //     updateConversationLastMessage(msg.conversationId, msg.content);

  //   }
  // });

  const wsRef = useChatSocket(seller?.id, (data) => {
    if (data.type === 'NEW_MESSAGE') {
      const msg = data.data;

      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (m) => m.tempId === msg.tempId
        );

        if (existingIndex !== -1) {
          const updated = [...prev];

          updated[existingIndex] = {
            ...msg,
            pending: false,
          };

          return updated;
        }

        return [...prev, msg];
      });

      updateConversationLastMessage(
        msg.conversationId,
        msg.content
      );
    }

    /**
     * USER ONLINE
     */
    if (data.type === 'USER_ONLINE') {
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old) return old;

        return old.map((chat: any) => {
          if (chat.user.id === data.userId) {
            return {
              ...chat,
              isOnline: true,
            };
          }

          return chat;
        });
      });

      setSelectedChat((prev: any) => {
        if (!prev) return prev;

        if (prev.user?.id === data.userId) {
          return {
            ...prev,
            isOnline: true,
          };
        }

        return prev;
      });
    }

    /**
     * USER OFFLINE
     */
    if (data.type === 'USER_OFFLINE') {
      queryClient.setQueryData(['conversations'], (old: any) => {
        if (!old) return old;

        return old.map((chat: any) => {
          if (chat.user.id === data.userId) {
            return {
              ...chat,
              isOnline: false,
            };
          }

          return chat;
        });
      });

      setSelectedChat((prev: any) => {
        if (!prev) return prev;

        if (prev.user?.id === data.userId) {
          return {
            ...prev,
            isOnline: false,
          };
        }

        return prev;
      });
    }
  });

  //  load messages when chat selected
  useEffect(() => {
    if (!selectedChat?.conversationId) return;

    fetchMessages();
  }, [selectedChat?.conversationId]);

  const fetchMessages = async () => {
    const { data } = await axiosInstance.get(
      `/chatting/api/seller/conversations/${selectedChat.conversationId}/messages`
    );

    setMessages(data.data);
    setCursor(data.pagination.nextCursor);
  };

  const loadMore = async () => {
    if (!cursor) return;

    const res = await refetch()
    if (res.data) {
      setMessages((prev) => [...res.data.data, ...prev]);
      setCursor(res.data.pagination.nextCursor);
    }
  };

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat)

    router.push(`/dashboard/inbox?conversationId=${chat.conversationId}`)
  }
  if (conversations.length === 0) {
    return (
      <div className="bg-[#1a1919] h-screen py-4">
        <div className="w-[90%] lg:w-[85%] mx-auto ">
          <div className="h-[95vh] rounded-2xl shadow-xl flex items-center justify-center">
            <h2 className="text-white font-semibold text-2xl">No conversations yet</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1919] h-screen py-4">
      <div className="w-[90%] lg:w-[85%] mx-auto ">
        <div className="flex flex-col lg:flex-row h-[95vh] rounded-2xl shadow-xl">

          {/* LEFT */}
          <div
            className={`
              ${selectedChat ? 'hidden lg:flex' : 'flex'}
              w-full lg:w-[250px] border-r border-r-gray-200 bg-[#F4F3F7] flex-col 
            `}
          >
            <div className="p-[17px] font-semibold text-lg">
              Messages
              <div className="h-[2px] bg-blue-600 mt-2 w-12" />
            </div>

            <div className="overflow-y-auto flex-1">
              {conversations.map((chat: any) => (
                <div
                  key={chat.conversationId}
                  onClick={() => handleSelectChat(chat)}
                  className={`flex gap-3 p-3 cursor-pointer hover:bg-gray-100 ${selectedChat?.conversationId === chat.conversationId && "bg-[#C5DFFA] hover:bg-[#C5DFFA]"}`}
                >
                  <div className="relative w-10 h-10">
                    <Image
                      src={chat?.user?.avatar || '/placeholder.png'}
                      alt="avatar"
                      fill
                      className="rounded-full object-cover"
                      sizes='12px'
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border ${chat.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                    />
                  </div>

                  <div className="flex flex-col w-full max-w-48">
                    <span className="font-medium text-sm">
                      {chat?.user?.name}
                    </span>
                    <span className="text-xs text-gray-500 line-clamp-1">
                      {chat?.lastMessage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div
            className={`
              ${selectedChat ? 'flex' : 'hidden lg:flex'}
              flex-1 flex-col bg-[#ECEDF4]
            `}
          >

            {!selectedChat ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a conversation to start chatting
              </div>
            ) : (
              <>
                {/* HEADER */}
                <div className="flex items-center gap-3 p-4 bg-white rounded-b-md">

                  {/* MOBILE BACK */}
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="lg:hidden text-sm font-medium text-gray-600"
                  >
                    <ArrowLeft />
                  </button>
                  <div className="relative w-10 h-10">
                    <Image
                      src={selectedChat?.user?.avatar || '/placeholder.png'}
                      alt="avatar"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="font-medium">
                      {selectedChat?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedChat?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {cursor && (
                    <button
                      onClick={loadMore}
                      className="text-xs text-blue-500 self-center"
                    >
                      Load more
                    </button>
                  )}

                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === seller?.id;

                    return (
                      <div
                        key={msg.tempId || i}
                        className={`flex flex-col gap-2 max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'
                          }`}
                      >
                        {/* TEXT MESSAGE */}
                        {msg.content && (
                          <div
                            className={`px-4 py-2 rounded-2xl text-sm break-words ${isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-black'
                              }`}
                          >
                            {msg.content}
                          </div>
                        )}
                        {/* ATTACHMENTS */}
                        {msg.attachments?.length > 0 && (
                          <div className="flex flex-wrap gap-2 max-w-full">
                            {msg.attachments.map((img: string, idx: number) => (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={idx}
                                onClick={() =>
                                  setPreviewImage({
                                    url: img,
                                    index: idx,
                                  })
                                }
                                className=" relative  overflow-hidden  rounded-2xl bg-white border shadow-sm hover:shadow-md transition" >

                                {/* SKELETON */}
                                {!loadedImages[img] && (
                                  <div className="w-32 h-32 sm:w-40 sm:h-40 animate-pulse bg-gray-200" />
                                )}

                                <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                                  <Image
                                    src={img}
                                    alt="attachment"
                                    fill
                                    unoptimized
                                    className={`object-cover  transition duration-300 ${loadedImages[img] ? 'opacity-100' : 'opacity-0'}`}
                                    sizes="(max-width: 640px) 128px, 160px"
                                    onLoad={() =>
                                      setLoadedImages((prev) => ({
                                        ...prev,
                                        [img]: true,
                                      }))
                                    }
                                  />
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                {/* IMAGE PREVIEW MODAL */}
                <AnimatePresence>
                  {previewImage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="
                        fixed inset-0 z-[100]
                        bg-black/90
                        backdrop-blur-sm
                        flex items-center justify-center
                        p-4
                      "
                      onClick={() => setPreviewImage(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="
                          relative
                          w-full
                          max-w-6xl
                          flex flex-col items-center
                        "
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* TOP ACTIONS */}
                        <div className="absolute top-0 right-0 -mt-8 z-10 flex gap-2">

                          {/* DOWNLOAD */}
                          <a
                            href={previewImage.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              flex items-center gap-2
                              bg-white/10
                              hover:bg-white/20
                              text-white
                              px-4 py-2
                              rounded-xl
                              backdrop-blur-md
                              transition
                            "
                          >
                            <Download size={18} />
                            <span className="hidden sm:inline">Download</span>
                          </a>

                          {/* CLOSE */}
                          <button
                            onClick={() => setPreviewImage(null)}
                            className="
                              flex items-center justify-center
                              bg-red-500/90
                              hover:bg-red-600
                              text-white
                              w-11 h-11
                              rounded-xl
                              transition
                            "
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {/* IMAGE CONTAINER */}
                        <div
                          className="relative w-full h-[75vh]  sm:h-[85vh] rounded-2xl"
                        >
                          <Image
                            src={previewImage.url}
                            alt="preview"
                            fill
                            unoptimized
                            priority
                            className=" object-contain  rounded-2xl"
                            sizes="100vw"
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* chat input */}
                <ChatInput
                  ws={wsRef}
                  conversationId={selectedChat?.conversationId}
                  senderId={seller?.id}
                  receiverId={selectedChat?.user?.id}
                  onMessageSent={(msg) => {
                    setMessages((prev) => {
                      const exists = prev.some(
                        (m) => m.tempId === msg.tempId
                      );

                      if (exists) return prev;

                      return [...prev, msg];
                    });
                    updateConversationLastMessage(msg.conversationId, msg.content || '📷 Image')
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;