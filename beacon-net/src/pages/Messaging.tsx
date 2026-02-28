import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Radio, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api, type Node, type Message } from "@/lib/api";

export default function Messaging() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getNodes().then(setNodes);
  }, []);

  useEffect(() => {
    if (selectedNode) {
      api.getMessages(selectedNode.id).then(setMessages);
    }
  }, [selectedNode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedNode) return;
    const msg = await api.sendMessage(selectedNode.id, input);
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="md:pl-16 h-[calc(100vh-3.5rem-5rem)] md:h-[calc(100vh-3.5rem-1.5rem)] flex">
      {/* Node List */}
      <div className={`${selectedNode ? "hidden md:flex" : "flex"} w-full md:w-72 flex-col border-r border-border`}>
        <h2 className="p-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Devices</h2>
        <div className="flex-1 overflow-y-auto space-y-1 px-2">
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all ${
                selectedNode?.id === node.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary border border-transparent"
              }`}
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Radio className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{node.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{node.id} · {node.distance}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedNode ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {selectedNode ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-border p-3">
              <button onClick={() => setSelectedNode(null)} className="md:hidden text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Radio className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{selectedNode.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{selectedNode.id}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.isSent
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.isSent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={e => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-background border-border"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Select a device to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
