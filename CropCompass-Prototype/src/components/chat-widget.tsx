
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Bot, MessageSquare } from 'lucide-react';
import ChatAssistant from './chat-assistant';
import { useTranslation } from '@/hooks/use-translation';

export default function ChatWidget() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-50"
                >
                    <MessageSquare className="h-8 w-8" />
                    <span className="sr-only">{t('chatAssistant.title')}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6" />
                        {t('chatAssistant.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('chatAssistant.description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-hidden p-4">
                    <ChatAssistant />
                </div>
            </DialogContent>
        </Dialog>
    );
}
