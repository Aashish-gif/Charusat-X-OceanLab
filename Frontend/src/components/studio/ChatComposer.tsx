import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, Send, Loader2 } from 'lucide-react';
import { useStudioStore } from '@/store/useStore';
import { convertTextToCloud, transcribeAudio } from '@/lib/textToCloudService';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

const parseDomainError = (error: unknown): { message: string; text?: string } | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  try {
    const parsed = JSON.parse(error.message);
    if (parsed?.type === 'OUT_OF_DOMAIN') {
      return {
        message: parsed.message || 'Zenith AI strictly supports AWS/Cloud services.',
        text: parsed.text,
      };
    }
  } catch {
    return null;
  }

  return null;
};

const parseSttUnavailableError = (error: unknown): { message: string } | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  try {
    const parsed = JSON.parse(error.message);
    if (parsed?.type === 'STT_UNAVAILABLE') {
      return {
        message: parsed.message || 'Speech-to-text provider is not configured.',
      };
    }
  } catch {
    return null;
  }

  return null;
};

const WELCOME_FLAG = 'zenith_cloud_welcome_seen';

const transcribeInBrowser = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error('Browser speech recognition is not supported.'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) {
        reject(new Error('No speech detected in browser fallback.'));
        return;
      }
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      reject(new Error(event?.error || 'Browser speech recognition failed.'));
    };

    recognition.onnomatch = () => {
      reject(new Error('Could not match speech in browser fallback.'));
    };

    recognition.start();
  });
};

const ChatComposer: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorShake, setErrorShake] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const { setNodes, setEdges, setTerraformCode } = useStudioStore();
  const navigate = useNavigate();

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (errorShake) setErrorShake(false);
  };

  const addAssistantMessage = (content: string) => {
    const errorMessage: Message = {
      id: `assistant-${Date.now()}`,
      content,
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
  };

  const processCloudCommand = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsGenerating(true);

    try {
      const processingMessage: Message = {
        id: `processing-${Date.now()}`,
        content: 'Processing...',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, processingMessage]);

      const result = await convertTextToCloud(text);

      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: result.message || 'Infrastructure Generated',
        role: 'assistant',
        timestamp: new Date(),
        summary: result.message,
        nodes: result.nodes,
        terraformCode: result.terraformCode,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (result.nodes && result.nodes.length > 0) {
        setNodes(result.nodes);
      }
      if (result.edges) {
        setEdges(result.edges);
      }
      if (result.terraformCode) {
        setTerraformCode(result.terraformCode);
      }

      const hasSeenWelcome = localStorage.getItem(WELCOME_FLAG) === 'true';
      setIsGenerating(false);
      if (!hasSeenWelcome && result.nodes && result.nodes.length > 0) {
        localStorage.setItem(WELCOME_FLAG, 'true');
        navigate('/welcome-cloud');
      }

    } catch (error: unknown) {
      console.error('Error processing command:', error);
      setIsGenerating(false);
      setMessages(prev => prev.filter(msg => msg.content !== 'Processing...'));

      const domainError = parseDomainError(error);
      if (domainError) {
        setErrorShake(true);
        if (domainError.text) {
          setInputValue(domainError.text);
        }
        addAssistantMessage(domainError.message);
        setTimeout(() => setErrorShake(false), 900);
      } else {
        addAssistantMessage('Sorry, I encountered an error processing your request.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    await processCloudCommand(inputValue);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      analyzerRef.current.fftSize = 256;
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        analyzerRef.current?.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
        setAudioLevel(average);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      let localTranscriptCache = '';
      let localRecognition: any = null;

      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          localRecognition = new SpeechRecognition();
          localRecognition.continuous = true;
          localRecognition.interimResults = true;
          localRecognition.onresult = (e: any) => {
             localTranscriptCache = Array.from(e.results)
              .map((res: any) => res[0].transcript)
              .join('');
          };
          localRecognition.start();
        }
      } catch (e) {
        console.warn("Native speech recognition init failed", e);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (localRecognition) {
          try { localRecognition.stop(); } catch(e) {}
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        
        cancelAnimationFrame(animationFrameRef.current);
        setAudioLevel(0);
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current?.state !== 'closed') {
           audioContextRef.current?.close();
        }

        setIsLoading(true);
        try {
           const result = await transcribeAudio(audioBlob);
           if (result.success && result.text) {
               setInputValue(result.text);
               await processCloudCommand(result.text); // auto-submit
           }
          } catch (error: unknown) {
             if (localTranscriptCache.trim()) {
                console.warn("Backend STT failed, using background listener mask:", localTranscriptCache);
                setInputValue(localTranscriptCache);
                await processCloudCommand(localTranscriptCache);
             } else {
                const domainError = parseDomainError(error);
                if (domainError) {
                   setErrorShake(true);
                   setInputValue(domainError.text || 'Out of domain command');
                   addAssistantMessage(domainError.message);
                   setTimeout(() => setErrorShake(false), 800);
                } else {
                   toast?.error('Transcription Failed. Please try again.');
                }
             }
        } finally {
           setIsLoading(false);
           setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setErrorShake(false);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for voice commands.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
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
    <div className="flex flex-col h-full bg-background/80 backdrop-blur-lg border border-glass-border rounded-lg overflow-hidden glass-panel relative">
      
      {/* Black Hole Loader */}
      <AnimatePresence>
         {isGenerating && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
             >
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-t-2 border-[#10b981] shadow-[0_0_30px_5px_rgba(16,185,129,0.5)]"
                    />
                    <motion.div
                      animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-2 rounded-full border-b-2 border-teal-400 opacity-70"
                    />
                    <div className="w-10 h-10 bg-black rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,1)]" />
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse">
                   Fabricating Infrastructure...
                </h3>
             </motion.div>
         )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="mb-4 text-4xl">💬</div>
            <h3 className="text-lg font-medium mb-2">Zenith AI Smart Mic</h3>
            <p className="text-sm max-w-md">
              Speak or describe your infrastructure needs and I'll generate the resources for you.
              Try: "Create a VPC with an EC2 instance". <br/>
              <span className="text-emerald-500 opacity-80 mt-2 block">Strict domain guardrails active.</span>
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
                    ? 'bg-primary text-primary-foreground rounded-br-none shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-background-secondary text-foreground rounded-bl-none border border-glass-border'
                }`}
              >
                {message.content === 'Processing...' ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#10b981]" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <div className={message.content.includes("Domain Guardrail") ? "text-[#fb7185] font-medium" : ""}>
                       {message.content}
                    </div>
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

      <div className="border-t border-glass-border p-3 bg-black/20">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <motion.div 
            className="relative flex-1"
            animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Describe your infrastructure..."
              className={`w-full bg-background-secondary border rounded-full py-3 pl-14 pr-12 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-300 ${
                errorShake 
                  ? 'border-[#fb7185] shadow-[0_0_15px_rgba(251,113,133,0.4)] ring-1 ring-[#fb7185]' 
                  : 'border-glass-border focus:ring-2 focus:ring-[#10b981]/50'
              }`}
              disabled={isLoading || isRecording}
            />
            {isRecording && (
              <div className="absolute left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                {[1, 2, 3].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute rounded-full border border-[#10b981]/60"
                    style={{
                      width: `${34 + ring * 16 + audioLevel / 7}px`,
                      height: `${34 + ring * 16 + audioLevel / 7}px`,
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      boxShadow: `0 0 ${6 + audioLevel / 8}px rgba(16,185,129,0.55)`,
                    }}
                    animate={{
                      opacity: [0.45, 0.1, 0.45],
                      scale: [0.92, 1.08, 0.92],
                    }}
                    transition={{
                      duration: 1.1 + ring * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={handleVoiceInput}
              style={{
                 boxShadow: isRecording
                   ? `0 0 ${8 + audioLevel / 3}px ${2 + audioLevel / 8}px rgba(16,185,129,0.7)`
                   : errorShake
                     ? '0 0 12px rgba(251,113,133,0.45)'
                     : 'none',
                 transform: `translateY(-50%) scale(${isRecording ? 1 + audioLevel / 280 : 1})`
              }}
              className={`absolute left-3 top-1/2 rounded-full p-2 transition-all duration-200 backdrop-blur-md border ${
                isRecording 
                  ? 'bg-[#10b981] text-black border-[#10b981]/70' 
                  : errorShake
                    ? 'text-[#fb7185] border-[#fb7185]/40 bg-[#fb7185]/10'
                    : 'text-muted-foreground border-glass-border bg-glass/20 hover:text-[#10b981] hover:bg-glass/40'
              }`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || isRecording}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-[#10b981] hover:text-emerald-300 disabled:opacity-50 hover:bg-glass/40 transition-colors"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default ChatComposer;