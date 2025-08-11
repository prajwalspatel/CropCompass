"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  chatAssistant,
  type ChatAssistantInput,
} from "@/ai/flows/chat-assistant";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, User, Bot } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatAssistant() {
    const { t, language } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    });

    const onSubmit: SubmitHandler<Omit<ChatAssistantInput, 'language'>> = async (data) => {
        setLoading(true);
        const userMessage: Message = { role: 'user', content: data.message };
        setMessages((prev) => [...prev, userMessage]);
        form.reset();

        try {
            const input: ChatAssistantInput = {
                ...data,
                language,
            };
            const response = await chatAssistant(input);
            const assistantMessage: Message = { role: 'assistant', content: response.response };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error with chat assistant:", error);
            toast({
                variant: "destructive",
                title: t('toasts.error'),
                description: t('toasts.chatAssistantError'),
            });
            // remove user message if there was an error
            setMessages((prev) => prev.slice(0, prev.length - 1));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div');
            if(viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);


    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-grow p-4 border rounded-lg" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <Bot className="h-12 w-12 mb-2" />
                            <p>Ask me anything about farming!</p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                            <div
                            key={index}
                            className={cn(
                                "flex items-start gap-4",
                                message.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {message.role === 'assistant' && (
                                <Avatar>
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "max-w-[75%] rounded-lg p-3",
                                message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                                <p className="text-sm">{message.content}</p>
                            </div>
                                {message.role === 'user' && (
                                <Avatar>
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                        {loading && (
                        <div className="flex items-start gap-4 justify-start">
                            <Avatar>
                                <AvatarFallback><Bot /></AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg p-3">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="mt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                            <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl>
                                <Input placeholder={t('chatAssistant.placeholder')} {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading} size="icon">
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
