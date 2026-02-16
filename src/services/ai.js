const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 
const MOCK_MODE = !API_KEY; // Auto-switches to Real mode if KEY is present

export const chatWithNPC = async (npcContext, playerInput) => {
    // 1. REAL GEMINI API CALL
    if (!MOCK_MODE && API_KEY) {
        try {
            const prompt = `
            You are a character in a stealth game.
            Role: ${npcContext.role || 'Citizen'}
            Context: ${JSON.stringify(npcContext)}
            Player says: "${playerInput}"
            
            Respond in JSON format:
            {
                "text": "Your dialogue response (max 2 sentences)",
                "mission": nullOrMissionObject
            }
            
            Mission Object Format (only if giving a mission):
            {
                "id": "unique_id",
                "title": "Mission Title",
                "description": "Objective",
                "status": "ACTIVE"
            }
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;
            
            // Clean up markdown code blocks if Gemini sends them
            const cleanJson = textResponse.replace(/^```json\n|\n```$/g, '');
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error("Gemini API Error:", error);
            return { text: "...", mission: null };
        }
    }

    // 2. MOCK FALLBACK
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[AI Stub] Context: ${JSON.stringify(npcContext)}, Input: ${playerInput}`);

    const lowerInput = playerInput.toLowerCase();

    if (lowerInput.includes('mission') || lowerInput.includes('job')) {
        return {
            text: "Shh. I have a job for you. There's a data drive in the northern warehouse. Retrieve it and I'll make it worth your while.",
            mission: {
                id: 'mission_' + Date.now(),
                title: 'Retrieve Data Drive',
                description: 'Get the drive from the North Warehouse.',
                status: 'ACTIVE'
            }
        };
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return {
            text: "Keep your voice down. The guards are everywhere today.",
            mission: null
        };
    } else {
        return {
            text: "I don't know what you're talking about. Move along.",
            mission: null
        };
    }
};
