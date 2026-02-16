import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../state/store';
import { chatWithNPC } from '../../services/ai';

const DialogueBox = () => {
    const { isOpen, npcId, messages } = useGameStore((state) => state.ui.dialogue);
    const closeDialogue = useGameStore((state) => state.closeDialogue);
    const addMessage = useGameStore((state) => state.addMessage);
    const setActiveMission = useGameStore((state) => state.setActiveMission);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userText = input;
        setInput('');
        addMessage('player', userText);
        setIsTyping(true);

        try {
            // Context could include player reputation, etc.
            const response = await chatWithNPC({ npcId }, userText);

            addMessage('npc', response.text);

            if (response.mission) {
                setActiveMission(response.mission);
                addMessage('system', `New Mission: ${response.mission.title}`);
            }
        } catch (error) {
            addMessage('system', 'Error communicating with NPC.');
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translate(-50%, 0)', // Centered, but framer handles transform
                    width: '600px',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    padding: '20px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    zIndex: 100,
                    marginLeft: '-300px' // CSS center hack since left 50%
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#00ff00' }}>Target: Unknown NPC</span>
                    <button onClick={closeDialogue} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>[X]</button>
                </div>

                <div style={{ height: '200px', overflowY: 'auto', marginBottom: '10px', borderBottom: '1px solid #333' }}>
                    {messages.length === 0 && <div style={{ color: '#666', fontStyle: 'italic' }}>Start the conversation...</div>}
                    {messages.map((msg, i) => (
                        <div key={i} style={{ marginBottom: '8px', textAlign: msg.sender === 'player' ? 'right' : 'left' }}>
                            <span style={{ color: msg.sender === 'player' ? '#00ccff' : (msg.sender === 'system' ? '#ffff00' : '#ff00ff'), fontWeight: 'bold' }}>
                                {msg.sender === 'player' ? 'YOU' : (msg.sender === 'system' ? 'SYSTEM' : 'NPC')}:
                            </span>
                            <span style={{ marginLeft: '8px' }}>{msg.text}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Say something..."
                        style={{
                            flex: 1,
                            backgroundColor: '#111',
                            border: '1px solid #333',
                            color: '#fff',
                            padding: '8px',
                            borderRadius: '4px',
                            marginRight: '10px'
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isTyping}
                        style={{
                            backgroundColor: '#333',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {isTyping ? '...' : 'Send'}
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default DialogueBox;
