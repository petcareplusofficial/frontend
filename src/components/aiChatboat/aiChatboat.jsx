import { useState, useRef, useEffect } from "react";
import { X, Minimize2 } from "lucide-react";
import AiChatSelected from "../../icon/AI-Chat-Desktop-Selected.svg";
import AiChatNotSelected from "../../icon/AI-Chat-Desktop-Not-Selected.svg";
import AiChatMessage from "../../icon/AI-Chat-Message.svg";
import Ollama from "../../ollama/ollama";
import { usePetContext } from "../../hooks/usePetContext";
import APIClient from "../../api/Api";
import "./aiChatboat.css";

export function AiChatboat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm PetCare+ AI Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const { pets, selectedPet } = usePetContext();
  const ollamaRef = useRef(null);

  useEffect(() => {
    console.log("selectedPet here new", selectedPet);
    const apiCalls = async () => {
      try {
        if (!selectedPet) return;
        const apiClient = new APIClient(
          `/meals-history/pets/${selectedPet._id}?time=lastMonth`,
        );
        const mealHistory = await apiClient.get();
        const apiClient2 = new APIClient(`/diets/pets/${selectedPet._id}`);
        const diet = await apiClient2.get();
        console.log("selectedPet BEFORE OLLAMA", selectedPet);
        const client = new Ollama(selectedPet, mealHistory, diet, null);
        ollamaRef.current = client;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    apiCalls();
  }, [selectedPet]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setCurrentMessage(userMessage.text);
    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(async () => {
      const botResponse = await generateBotResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateBotResponse = async (message) => {
    const lowerMessage = message.toLowerCase();
    const botResponse = await ollamaRef.current.Response(lowerMessage);
    return botResponse;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const quickActions = [
    { label: "Give pet stats", action: "pet stats" },
    { label: "Health Checkup", action: "health checkup" },
    { label: "Recommendations", action: "recommendations" },
    { label: "Routine Improvemnt", action: "routine" },
  ];

  const handleQuickAction = (action) => {
    setInputMessage(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {!isOpen && (
        <button
          className="chat-float-button"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <img src={AiChatNotSelected} alt="Chat" width={60} height={60} />
        </button>
      )}

      {isOpen && (
        <div className={`chat-window ${isMinimized ? "minimized" : ""}`}>
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <img src={AiChatSelected} alt="AI Chat" width={40} height={40} />
              </div>
              <div className="chat-header-text">
                <h3>PetCare+ AI</h3>
                <span className="chat-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-action-btn"
                onClick={toggleMinimize}
                aria-label="Minimize chat"
              >
                <Minimize2 size={18} />
              </button>
              <button
                className="chat-action-btn"
                onClick={toggleChat}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="chat-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-message ${message.sender === "user" ? "user-message" : "bot-message"}`}
                  >
                    {message.sender === "bot" && (
                      <div className="message-avatar">
                        <img src={AiChatSelected} alt="Bot" width={30} height={30} />
                      </div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">{message.text}</div>
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="chat-message bot-message">
                    <div className="message-avatar">
                      <img src={AiChatSelected} alt="Bot" width={16} height={16} />
                    </div>
                    <div className="message-content">
                      <div className="message-bubble typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {messages.length <= 2 && (
                <div className="chat-quick-actions">
                  <p className="quick-actions-title">Quick actions:</p>
                  <div className="quick-actions-grid">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="quick-action-btn"
                        onClick={() => handleQuickAction(action.action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="chat-input-container">
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                />
                <button
                  className="chat-send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  aria-label="Send message"
                >
                  <img src={AiChatMessage} alt="Send" width={20} height={20} />
                </button>
              </div>

              <div className="chat-footer">
                <span>Powered by PetCare+ AI</span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default AiChatboat;