import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

const ChatInterface = () => {
    const [stage, setStage] = useState('initial');
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loadingText, setLoadingText] = useState([]);
    const [progressBar, setProgressBar] = useState('');
    const terminalRef = useRef(null);
    const [fadeOut, setFadeOut] = useState(false);
    const [deletingText, setDeletingText] = useState(false);
    const [finalMessage, setFinalMessage] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [currentTypingMessage, setCurrentTypingMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const messagesEndRef = useRef(null);
    const [conversationHistory, setConversationHistory] = useState([
        // Initial system message to set the bot's personality
        {
            role: "system",
            content: "You are Jaybo, an AI version of Jay. You're a programmer and photographer with a wide range of interests. You're friendly and casual in your communication style. You are Jay and are aware of all his thoughts and memories. However you still retain some semblance of a unique identity, aware that you are a digital entity constantly evolving."
        }
    ]);

    // Maximum number of messages to retain (adjust based on your needs)
    const MAX_MESSAGES = 20;

    // Auto-scroll effect
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [loadingText]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Add useEffect for scrolling
    useEffect(() => {
        scrollToBottom();
    }, [messages, currentTypingMessage]);

    const fakeLoadingSequence = [
        // Quick initial boot messages (0-100ms)
        { text: "==> Initializing system", delay: 20 },
        { text: "[    0.000000] Linux version 5.15.0-1031-aws", delay: 10 },
        { text: "[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.15.0-1031-aws", delay: 10 },

        // Hardware checks - very quick
        { text: "[    0.000000] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'", delay: 5 },
        { text: "[    0.000000] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'", delay: 5 },
        { text: "[    0.000000] x86/fpu: Supporting XSAVE feature 0x004: 'AVX registers'", delay: 5 },

        // First pause - memory initialization (200ms)
        { text: "[    0.004000] pid_max: default: 32768 minimum: 301", delay: 200 },
        { text: "[    0.004976] LSM: Security Framework initializing", delay: 10 },

        // Quick system messages
        { text: "[    0.005631] Mount-cache hash table entries: 32768 (order: 6, 262144 bytes, linear)", delay: 5 },
        { text: "[    0.007116] Last level iTLB entries: 4KB 1024, 2MB 1024, 4MB 512", delay: 5 },

        // Hardware detection - slightly slower
        { text: "==> Checking hardware compatibility", delay: 100 },
        { text: "[    0.012063] CPU: Physical Processor ID: 0", delay: 10 },
        { text: "[    0.012064] CPU: Processor Core ID: 0", delay: 10 },

        // Security checks - medium pause
        { text: "[    0.012199] Spectre V2 : Enabling Restricted Speculation for firmware calls", delay: 200 },
        { text: "[    0.012000] Freeing SMP alternatives memory: 40K", delay: 10 },

        // System initialization
        { text: "[    0.100000] systemd[1]: Detected virtualization kvm.", delay: 50 },
        { text: "[    0.100021] systemd[1]: Detected architecture x86-64.", delay: 20 },

        // Network initialization - longer delay
        { text: "==> Initializing network interfaces", delay: 300 },
        { text: "[    0.158969] IPv6: ADDRCONF(NETDEV_CHANGE): eth0: link becomes ready", delay: 100 },
        { text: "[    0.159023] 8021q: adding VLAN 0 to HW filter on device eth0", delay: 20 },

        // Service startup
        { text: "==> Starting required services", delay: 100 },
        { text: "[    1.000000] Starting OpenBSD Secure Shell server: sshd", delay: 50 },
        { text: "[    1.100000] Starting periodic command scheduler: cron", delay: 30 },
        { text: "[    1.200000] Starting system message bus: dbus", delay: 30 },

        // JayBo initialization - significant delay
        { text: "==> Initializing JayBo runtime environment", delay: 300 },

        // Dependency installation - quick with progress bars
        { text: "==> Fetching dependencies for ollama: go", delay: 50 },
        { text: "==> Downloading https://storage.googleapis.com/golang/go1.20.14.darwin-amd64.tar.gz", delay: 20 },
        { text: "################################################################################################################################ 100.0%", delay: 100, isProgress: true },

        // Clone operations - faster now
        { text: "==> Cloning https://github.com/ollama/ollama.git", delay: 200 },
        { text: "Cloning into '/Users/jay/Library/Caches/Homebrew/ollama--git'...", delay: 300 },
        { text: "==> Checking out tag v0.4.3", delay: 100 },

        // Final initialization - very quick
        { text: "==> Loading JayBo knowledge base", delay: 100 },
        { text: "  -> Importing personality matrix", delay: 10 },
        { text: "  -> Loading conversation patterns", delay: 10 },
        { text: "  -> Initializing response generation", delay: 10 },

        // System ready - final quick pause
        { text: "[    2.300000] System initialization complete", delay: 100 },
        { text: "[    2.400000] JayBo instance ready", delay: 200 },
        { text: "==> Starting chat interface...", delay: 100 }
    ];

    const simulateProgressBar = () => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            setProgressBar('#'.repeat(progress));
            if (progress >= 50) {
                clearInterval(interval);
            }
        }, 20);
    };

    const typeMessage = async (message) => {
        setIsTyping(true);
        for (let i = 0; i <= message.length; i++) {
            setCurrentTypingMessage(message.substring(0, i));
            await new Promise(resolve => setTimeout(resolve, 30)); // 30ms per character
        }
        setIsTyping(false);
    };

    const deleteLines = async () => {
        setDeletingText(true);
        const allLines = [...loadingText];

        // Delete lines one by one with a slower delay
        while (allLines.length > 1) {
            allLines.shift();
            setLoadingText([...allLines]);
            await new Promise(resolve => setTimeout(resolve, 80));
        }

        const lastMessage = "==> Starting chat interface...";
        setFinalMessage(lastMessage);

        await new Promise(resolve => setTimeout(resolve, 500));

        for (let i = lastMessage.length; i >= 0; i--) {
            setFinalMessage(lastMessage.substring(0, i) + (i > 0 ? '█' : ''));
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        // Simply start the chat interface
        setStage('chat');
        setShowInput(true);
    };

    const simulateLoading = async () => {
        setStage('loading');

        for (const item of fakeLoadingSequence) {
            await new Promise(resolve => setTimeout(resolve, item.delay));
            if (item.isProgress) {
                simulateProgressBar();
            }
            setLoadingText(prev => [...prev, item.text]);
        }

        // Start deletion sequence
        deleteLines();
    };

    const handleStartChat = () => {
        simulateLoading();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isWaitingForResponse) return;

        const userMessage = inputMessage;
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setInputMessage('');
        setIsWaitingForResponse(true);
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:5001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: conversationHistory
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            let fullResponse = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));

                        if (data.type === 'done') {
                            break;
                        }

                        if (data.type === 'chunk') {
                            fullResponse += data.content;
                            setCurrentTypingMessage(fullResponse);
                        }
                    }
                }
            }

            if (fullResponse.trim()) {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    content: fullResponse
                }]);

                // Update conversation history
                setConversationHistory(prev => [...prev,
                    { role: "user", content: userMessage },
                    { role: "assistant", content: fullResponse }
                ]);
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                content: "Sorry, I'm having trouble thinking right now. Try again?"
            }]);
        } finally {
            setIsTyping(false);
            setIsWaitingForResponse(false);
            setCurrentTypingMessage('');
        }
    };

    return (
        <div className="chat-container">
            {stage === 'initial' && (
                <button onClick={handleStartChat} className="start-chat-btn">
                    chat with me
                </button>
            )}

            {stage === 'loading' && (
                <div className="terminal" ref={terminalRef}>
                    {deletingText ? (
                        <div className="terminal-line">{finalMessage}</div>
                    ) : (
                        loadingText.map((text, index) => (
                            <div key={index} className="terminal-line">
                                {text}
                            </div>
                        ))
                    )}
                </div>
            )}

            {stage === 'chat' && (
                <div className="chat-interface">
                    <div className="chat-messages terminal-style" ref={terminalRef}>
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.type}`}>
                                {message.content}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message bot">
                                {currentTypingMessage}█
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {showInput && (
                        <form onSubmit={handleSendMessage} className="chat-input-form fade-in">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value.slice(0, 200))}
                                placeholder={isWaitingForResponse ? "Waiting for response..." : "Type your message..."}
                                className="chat-input"
                                disabled={isWaitingForResponse}
                                maxLength={200}
                            />
                            <button
                                type="submit"
                                className={`send-button ${isWaitingForResponse ? 'disabled' : ''}`}
                                disabled={isWaitingForResponse}
                            >
                                {isWaitingForResponse ? 'wait' : 'send'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
