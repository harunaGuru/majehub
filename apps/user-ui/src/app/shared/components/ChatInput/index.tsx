'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { axiosInstance } from '@/utils/axiosInstance'
import { toBase64 } from '@/utils/convertToBase64'
import { isProtected } from '@/utils/isProtected'



type Props = {
  ws: React.RefObject<WebSocket | null>
  conversationId: string
  senderId: string
  receiverId: string
  onMessageSent?: (msg: any) => void
}

const uploadImage = async (base64: string, fileName: string) => {
  const { data } = await axiosInstance.post('/product/api/upload-image', {
    file: base64,
    fileName,
    folder: '/chat',
  }, isProtected())
  return data // { url }
}

const ChatInput = ({
  ws,
  conversationId,
  senderId,
  receiverId,
  onMessageSent,
}: Props) => {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const tempId = crypto.randomUUID();


  useEffect(() => {
    inputRef.current?.focus()
  }, [conversationId])


  // 🔥 HANDLE FILE UPLOAD
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const base64 = await toBase64(file)
        const res = await uploadImage(base64, file.name)
        uploadedUrls.push(res.url)
      }

      setAttachments((prev) => [...prev, ...uploadedUrls])
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setIsUploading(false)
    }
  }

  // 🔥 SEND MESSAGE
  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return
    const payload = {
      type: 'SEND_MESSAGE',
      tempId,
      conversationId,
      senderId,
      receiverId,
      content: message,
      attachments,
      senderRole: 'USER',
      receiverRole: 'SELLER',
    }

    ws.current?.send(JSON.stringify(payload))

    // optimistic
    onMessageSent?.({
      conversationId,
      senderId,
      content: message,
      attachments,
      createdAt: new Date().toISOString(),
    })

    setMessage('')
    setAttachments([])
    setShowEmoji(false)
  }

  return (
    <div className="bg-white px-3 py-2 w-[80%] relative rounded-md">
      {/* attachments preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {attachments.map((file, i) => (
            <img
              key={i}
              src={file}
              className="w-14 h-14 object-cover rounded-md border"
            />
          ))}
        </div>
      )}

      {/* emoji picker */}
      {showEmoji && (
        <div className="absolute bottom-16 left-4 z-50">
          <EmojiPicker
            onEmojiClick={(emojiData) =>
              setMessage((prev) => prev + emojiData.emoji)
            }
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* emoji */}
        <button
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Smile size={20} />
        </button>

        {/* attach */}
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="file"
          multiple
          hidden
          ref={fileRef}
          onChange={handleFileChange}
        />

        {/* input */}
        <input
          value={message}
          ref={inputRef}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full outline-none text-sm"
        />

        {/* send */}
        <button
          onClick={handleSend}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  )
}

export default ChatInput