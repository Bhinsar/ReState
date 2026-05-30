import React from 'react';
import ChatView from '@/components/pages/chat/ChatView';

export const metadata = {
    title: 'Messages | ReState',
    description: 'Chat in real-time with property owners, agents, and other users on ReState.',
};

export default function ChatPage() {
    return <ChatView />;
}
