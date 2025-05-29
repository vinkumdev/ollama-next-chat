'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import copy from 'copy-to-clipboard';
import 'highlight.js/styles/github.css';
import CodeBlock from './CodeBlock';

export default function Home() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState('mistral');
    const [models, setModels] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetch('/api/models')
            .then(res => res.json())
            .then(data => {
                if (data.models && data.models.length > 0) {
                    setModels(data.models);
                    setModel(data.models[0]); // default selection
                }
            });
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('ollama-chat');
        if (saved) setMessages(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('ollama-chat', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const res = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages: newMessages,
                stream: true,
            }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullMessage = '';

        const assistantMsg = { role: 'assistant', content: '' };
        setMessages([...newMessages, assistantMsg]);

        if (!reader) return;

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            for (const line of chunk.split('\n')) {
                if (line.trim()) {
                    try {
                        const json = JSON.parse(line);
                        if (json.message?.content) {
                            fullMessage += json.message.content;
                            setMessages((prev) => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: 'assistant',
                                    content: fullMessage,
                                };
                                return updated;
                            });
                        }
                    } catch (err) {
                        console.error('JSON parse error:', err);
                    }
                }
            }
        }

        setIsLoading(false);
    };

    const resetChat = () => {
        setMessages([]);
        localStorage.removeItem('ollama-chat');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        setInput((prev) => prev + '\n\n' + text);
    };

    const CodeBlock = ({ className, children }) => {
        const [copied, setCopied] = useState(false);
        const codeRef = useRef(null);

        const handleCopy = () => {
            if (codeRef.current) {
                copy(codeRef.current.innerText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
            }
        };

        return (
            <div className="relative group">
                <pre className="overflow-auto rounded-md p-2" ref={codeRef}>
                    <code className={className}>{children}</code>
                </pre>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        );
    };

    return (
        <main className="flex flex-col h-screen w-[900px] mx-auto">
            <header className="p-4 border-b font-bold text-xl bg-white shadow flex justify-between items-center">
                Ollama + Nextjs Chat
                <select
                    className="border px-2 py-1 rounded"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                >
                    {models.length === 0 ? (
                        <option>Loading models...</option>
                    ) : (
                        models.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))
                    )}
                </select>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-md whitespace-pre-wrap ${
                            msg.role === 'user'
                                ? 'bg-blue-100 self-end ml-auto'
                                : 'bg-gray-100 self-start mr-auto'
                        }`}
                    >
                        <ReactMarkdown
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                                code: CodeBlock,
                                p: ({ children }) => <p className="mb-2">{children}</p>,
                            }}
                        >
                            {msg.content}
                        </ReactMarkdown>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <footer className="p-4 bg-white border-t flex flex-col gap-2">
                <textarea
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded resize-none"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />

                <div className="flex gap-2 justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={sendMessage}
                            disabled={!input || isLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                        <button
                            onClick={resetChat}
                            className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Reset
                        </button>
                    </div>

                    <label className="cursor-pointer text-sm text-blue-600 underline">
                        Upload File
                        <input
                            type="file"
                            accept=".txt,.md"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                </div>
            </footer>
        </main>
    );
}
