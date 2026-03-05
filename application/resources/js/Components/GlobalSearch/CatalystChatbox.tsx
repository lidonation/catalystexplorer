import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowLeft, Send, Loader2, Trash2 } from 'lucide-react';
import AIPromptIcon from '../svgs/AIPromptIcon';
import Paragraph from '../atoms/Paragraph';
import Button from '@/Components/atoms/Button';
import TextInput from '@/Components/atoms/TextInput';
import { cn } from '@/utils/cn';
import useRoute from '@/useHooks/useRoute';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface CatalystChatboxProps {
    onBack: () => void;
}

const STORAGE_KEY = 'catalyst-chatbox-messages';

// Helper functions for localStorage serialization
const serializeMessages = (messages: Message[]): string => {
    return JSON.stringify(messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
    })));
};

const deserializeMessages = (data: string): Message[] => {
    try {
        const parsed = JSON.parse(data);
        return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }));
    } catch {
        return [];
    }
};

export default function CatalystChatbox({ onBack }: CatalystChatboxProps) {
    const { t } = useLaravelReactI18n();
    const route = useRoute();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const savedMessages = localStorage.getItem(STORAGE_KEY);
        if (savedMessages) {
            const restored = deserializeMessages(savedMessages);
            if (restored.length > 0) {
                setMessages(restored);
                return;
            }
        }

        const welcomeMessage: Message = {
            id: 'welcome',
            role: 'assistant',
            content: t('catalyst.chatbox.welcome'),
            timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
    }, [t]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, serializeMessages(messages));
        }
    }, [messages]);

    const sendMessage = useCallback(async (userMessage: string) => {
        if (!userMessage.trim() || isLoading) return;

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: userMessage.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setIsStreaming(true);

        abortControllerRef.current = new AbortController();

        try {
            const assistantMsg: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMsg]);

            let chatUrl: string;
            try {
                chatUrl = route('vizra.api.openai.chat.completions');
            } catch {
                chatUrl = '/api/vizra-adk/chat/completions';
            }

            const response = await fetch(chatUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({
                    model: 'catalyst-chatbox',
                    messages: [
                        ...messages.filter(m => m.id !== 'welcome').map(m => ({
                            role: m.role,
                            content: m.content
                        })),
                        { role: 'user', content: userMessage.trim() }
                    ],
                    stream: true,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response stream available');
            }

            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        if (data === '[DONE]') {
                            setIsStreaming(false);
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';

                            if (content) {
                                accumulatedContent += content;

                                setMessages(prev =>
                                    prev.map(msg =>
                                        msg.id === assistantMsg.id
                                            ? { ...msg, content: accumulatedContent }
                                            : msg
                                    )
                                );
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse streaming data:', parseError);
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }

            console.error('Chat error:', error);

            const errorMsg: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: t('catalyst.chatbox.error'),
                timestamp: new Date(),
            };

            setMessages(prev => [...prev.slice(0, -1), errorMsg]);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, [messages, isLoading, t]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    }, [input, sendMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    const handleStop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            setIsStreaming(false);
        }
    }, []);

    const handleClearChat = useCallback(() => {
        const welcomeMessage: Message = {
            id: 'welcome',
            role: 'assistant',
            content: t('catalyst.chatbox.welcome'),
            timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        localStorage.removeItem(STORAGE_KEY);
    }, [t]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex h-full flex-col"
        >
            {/* Header */}
            <div className="border-border-primary flex items-center gap-3 border-b px-4 py-3">
                <Button
                    onClick={onBack}
                    className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                    data-testid="catalyst-chatbox-back"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                    <AIPromptIcon className="text-primary" width={20} height={20} />
                    <Paragraph className="text-content font-semibold">
                        {t('catalyst.chatbox.title')}
                    </Paragraph>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    {messages.length > 1 && (
                        <Button
                            onClick={handleClearChat}
                            className="h-8 w-8 p-0 bg-transparent text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            data-testid="catalyst-chatbox-clear"
                            ariaLabel={t('catalyst.chatbox.clear')}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                    {isStreaming && (
                        <Button
                            onClick={handleStop}
                            className="text-xs px-2 py-1 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {t('catalyst.chatbox.stop')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn(
                                    "flex gap-3",
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-lg px-3 py-2",
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background-darker text-content border border-border-primary'
                                    )}
                                >
                                    <Paragraph
                                        className={cn(
                                            "text-sm whitespace-pre-wrap",
                                            message.role === 'user' ? 'text-primary-foreground' : 'text-content'
                                        )}
                                    >
                                        {message.content}
                                        {message.role === 'assistant' && isStreaming &&
                                         message.id === messages[messages.length - 1]?.id && (
                                            <motion.span
                                                animate={{ opacity: [1, 0] }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                                className="ml-1 inline-block"
                                            >
                                                ▊
                                            </motion.span>
                                        )}
                                    </Paragraph>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-border-primary border-t px-4 py-3">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <TextInput
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('catalyst.chatbox.placeholder')}
                        disabled={isLoading}
                        className="flex-1"
                        data-testid="catalyst-chatbox-input"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        data-testid="catalyst-chatbox-send"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </motion.div>
    );
}
