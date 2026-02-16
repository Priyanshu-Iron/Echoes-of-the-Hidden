// Mock AI Service pretending to be an LLM
export const chatWithNPC = async (npcContext, playerInput) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`[AI Stub] Context: ${JSON.stringify(npcContext)}, Input: ${playerInput}`);

    // Simple keyword matching for demo purposes
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
