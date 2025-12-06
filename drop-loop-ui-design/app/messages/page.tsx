"use client"

import { useState } from "react"
import { Send, Phone, Video, MoreVertical, Search, Plus, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

interface Chat {
  id: string
  participantName: string
  participantAvatar: string
  lastMessage: string
  timestamp: string
  unread: number
}

interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  timestamp: string
  imageUrl?: string
}

const mockChats: Chat[] = [
  {
    id: "1",
    participantName: "John D.",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    lastMessage: "Great! I can deliver tomorrow.",
    timestamp: "2 min",
    unread: 1,
  },
  {
    id: "2",
    participantName: "Emma R.",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    lastMessage: "Perfect, see you then!",
    timestamp: "1 hour",
    unread: 0,
  },
  {
    id: "3",
    participantName: "Alex K.",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    lastMessage: "I'm on my way to Boston",
    timestamp: "3 hours",
    unread: 0,
  },
  {
    id: "4",
    participantName: "Sarah M.",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMessage: "Thank you for the delivery!",
    timestamp: "Yesterday",
    unread: 0,
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Hi! Are you still interested in delivering my package?",
    senderId: "me",
    senderName: "You",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    text: "Yes! I'm flying to Boston tomorrow. When do you need it delivered?",
    senderId: "user1",
    senderName: "John D.",
    timestamp: "10:35 AM",
  },
  {
    id: "3",
    text: "Tomorrow evening would be perfect. Can you deliver by 6 PM?",
    senderId: "me",
    senderName: "You",
    timestamp: "10:37 AM",
  },
  {
    id: "4",
    text: "Great! I can deliver tomorrow. I'll send you my flight details.",
    senderId: "user1",
    senderName: "John D.",
    timestamp: "10:40 AM",
  },
]

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string>("1")
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const [messageInput, setMessageInput] = useState("")

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput("")
    }
  }

  const currentChat = mockChats.find((chat) => chat.id === selectedChat)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List - Hidden on mobile when viewing chat */}
        <div
          className={`${
            mobileView === "list" ? "flex" : "hidden"
          } md:flex w-full md:w-80 flex-col border-r border-border bg-card/30`}
        >
          {/* Header */}
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Messages</h1>
              <Button variant="ghost" size="icon">
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {mockChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat.id)
                  setMobileView("chat")
                }}
                className={`w-full p-4 border-b border-border text-left hover:bg-background/50 transition-colors ${
                  selectedChat === chat.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.participantAvatar || "/placeholder.svg"}
                      alt={chat.participantName}
                      className="h-10 w-10 rounded-full"
                    />
                    {chat.unread > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold truncate">{chat.participantName}</h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col bg-background`}>
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card/30">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileView("list")}
                    className="md:hidden p-1 hover:bg-background rounded transition-colors"
                  >
                    ←
                  </button>
                  <img
                    src={currentChat.participantAvatar || "/placeholder.svg"}
                    alt={currentChat.participantName}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold">{currentChat.participantName}</h2>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md space-y-1 ${
                        message.senderId === "me" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.senderId === "me"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-card border border-border rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <span className="text-xs text-muted-foreground px-4">{message.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border space-y-4">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
