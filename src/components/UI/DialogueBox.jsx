/**
 * DialogueBox — Chat interface for NPC interactions.
 * Accessible dialog with focus trapping, ARIA attributes,
 * input sanitization, and glassmorphism styling.
 * 
 * @module components/UI/DialogueBox
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../state/store';
import { chatWithNPC } from '../../services/ai';
import { MAX_DIALOGUE_INPUT_LENGTH } from '../../game/constants';

const DialogueBox = () => {
    const { isOpen, npcId, npcName, npcRole, messages } = useGameStore((state) => state.ui.dialogue);
    const closeDialogue = useGameStore((state) => state.closeDialogue);
    const addMessage = useGameStore((state) => state.addMessage);
    const setActiveMission = useGameStore((state) => state.setActiveMission);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const dialogRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus trap and ESC handler
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            closeDialogue();
        }
        // Trap tab within dialog
        if (e.key === 'Tab' && dialogRef.current) {
            const focusable = dialogRef.current.querySelectorAll(
                'button, input, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }, [closeDialogue]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    /**
     * Sanitize input and send to AI service.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = input.trim().slice(0, MAX_DIALOGUE_INPUT_LENGTH);
        if (!trimmed || isTyping) return;

        setInput('');
        addMessage('player', trimmed);
        setIsTyping(true);

        try {
            const response = await chatWithNPC({ npcId, role: npcRole, name: npcName }, trimmed);
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
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={`Conversation with ${npcName || 'NPC'}`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'min(600px, 90vw)',
                    backgroundColor: 'rgba(8, 8, 16, 0.85)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    color: '#fff',
                    fontFamily: "'Inter', sans-serif",
                    zIndex: 100,
                    marginLeft: 'min(-300px, -45vw)',
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6), 0 0 80px rgba(0, 255, 170, 0.05)',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                    <div>
                        <span style={{
                            color: '#00ffaa',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                        }}>
                            {npcName || 'Unknown'}
                        </span>
                        <span style={{
                            color: 'rgba(255, 255, 255, 0.3)',
                            fontSize: '0.7rem',
                            marginLeft: '10px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                        }}>
                            {npcRole || ''}
                        </span>
                    </div>
                    <button
                        onClick={closeDialogue}
                        aria-label="Close dialogue (Escape)"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.4)',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        ESC
                    </button>
                </div>

                {/* Messages */}
                <div
                    role="log"
                    aria-label="Conversation messages"
                    aria-live="polite"
                    style={{
                        height: '200px',
                        overflowY: 'auto',
                        marginBottom: '14px',
                        paddingRight: '4px',
                    }}
                >
                    {messages.length === 0 && (
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.25)',
                            fontStyle: 'italic',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            marginTop: '40px',
                        }}>
                            Start the conversation...
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            marginBottom: '10px',
                            textAlign: msg.sender === 'player' ? 'right' : 'left',
                        }}>
                            <div style={{
                                display: 'inline-block',
                                backgroundColor: msg.sender === 'player'
                                    ? 'rgba(0, 100, 255, 0.15)'
                                    : msg.sender === 'system'
                                        ? 'rgba(255, 215, 0, 0.1)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                padding: '8px 14px',
                                maxWidth: '80%',
                            }}>
                                <span style={{
                                    fontSize: '0.6rem',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    color: msg.sender === 'player' ? '#4488ff'
                                        : msg.sender === 'system' ? '#ffd700'
                                            : '#00ffaa',
                                    display: 'block',
                                    marginBottom: '3px',
                                }}>
                                    {msg.sender === 'player' ? 'YOU' : (msg.sender === 'system' ? 'SYSTEM' : npcName || 'NPC')}
                                </span>
                                {/* XSS Prevention: render as text only, never as HTML */}
                                <span style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{msg.text}</span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ textAlign: 'left', marginBottom: '10px' }} aria-label={`${npcName} is typing`}>
                            <div style={{
                                display: 'inline-block',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                padding: '8px 14px',
                            }}>
                                <span style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255,255,255,0.4)',
                                }}>
                                    typing...
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Say something..."
                        maxLength={MAX_DIALOGUE_INPUT_LENGTH}
                        aria-label="Type your message to the NPC"
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#fff',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontFamily: "'Inter', sans-serif",
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isTyping}
                        aria-label={isTyping ? 'Waiting for response' : 'Send message'}
                        style={{
                            backgroundColor: isTyping ? 'rgba(255,255,255,0.02)' : 'rgba(0, 255, 170, 0.15)',
                            color: isTyping ? 'rgba(255,255,255,0.3)' : '#00ffaa',
                            border: '1px solid rgba(0, 255, 170, 0.2)',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            cursor: isTyping ? 'not-allowed' : 'pointer',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.8rem',
                            letterSpacing: '1px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {isTyping ? '...' : 'SEND'}
                    </button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
};

export default DialogueBox;
