import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, Send, Loader2 } from 'lucide-react';
import { useStudioStore } from '@/store/useStore';
import { convertTextToCloud } from '@/lib/textToCloudService';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  summary?: string;
  nodes?: any[];
  edges?: any[];
  terraformCode?: string;
}

const ChatComposer: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { setNodes, setEdges, setTerraformCode } = useStudioStore();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Add processing message
      const processingMessage: Message = {
        id: `processing-${Date.now()}`,
        content: 'Processing...',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, processingMessage]);

      // Call the RAG-LLM service
      const result = await convertTextToCloud(inputValue);

      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: result.message,
        role: 'assistant',
        timestamp: new Date(),
        summary: result.message,
        nodes: result.nodes,
        terraformCode: result.terraformCode,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-apply: Update the canvas and editor
      if (result.nodes) {
        setNodes(result.nodes);
      }
      if (result.edges) {
        setEdges(result.edges);
      }
      if (result.terraformCode) {
        setTerraformCode(result.terraformCode);
      }
    } catch (error) {
      console.error('Error processing command:', error);
      
      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.content === 'Processing...'));
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
    recognitionRef.current = recognition;
  };

  const handleSpeakSummary = (summary: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/80 backdrop-blur-lg border border-glass-border rounded-lg overflow-hidden">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="mb-4 text-4xl">💬</div>
            <h3 className="text-lg font-medium mb-2">AI Infrastructure Assistant</h3>
            <p className="text-sm max-w-md">
              Describe your infrastructure needs and I'll generate the resources for you.
              Try: "Create a VPC with an EC2 instance".
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-background-secondary text-foreground rounded-bl-none border border-glass-border'
                }`}
              >
                {message.content === 'Processing...' ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <div>{message.content}</div>
                    {message.summary && (
                      <div className="mt-2 pt-2 border-t border-glass-border/50 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{message.summary}</span>
                        <button
                          onClick={() => handleSpeakSummary(message.summary!)}
                          className="ml-2 p-1 rounded-full hover:bg-glass/50 transition-colors"
                          title="Listen to summary"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </>
                )}
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-glass-border p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Describe your infrastructure (e.g., 'Add a VPC with an EC2')..."
              className="w-full bg-background-secondary border border-glass-border rounded-full py-3 pl-12 pr-12 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'
              }`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatComposer;