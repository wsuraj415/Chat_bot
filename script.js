const apiKey = 'nPAxDroBfnEkNU8yS9ltiMUgLBfJKNDL'; // Replace with your actual API key
const externalUserId = 'dhownit'; // Replace with your actual external user ID

// Function to create a chat session
async function createChatSession() {
    try {
        const response = await axios.post(
            'https://api.on-demand.io/chat/v1/sessions',
            {
                pluginIds: [],
                externalUserId: externalUserId
            },
            {
                headers: {
                    apikey: apiKey
                }
            }
        );
        return response.data.data.id; // Extract session ID
    } catch (error) {
        console.error('Error creating chat session:', error);
    }
}

// Function to submit a query
async function submitQuery(sessionId, query) {
    try {
        const response = await axios.post(
            `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
            {
                endpointId: 'predefined-openai-gpt4o',
                query: query,
                pluginIds: ['plugin-1726252750'],
                responseMode: 'sync'
            },
            {
                headers: {
                    apikey: apiKey
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error submitting query:', error);
    }
}

// Function to detect URLs and convert them to clickable links
function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}

// Function to add messages to the chat box with proper formatting
function addToChatBox(sender, message) {
    const messageElement = document.createElement('p');
    messageElement.className = sender === 'You' ? 'user-message' : 'bot-message';

    if (sender !== 'You') {
        // If it's the bot's message, parse links
        message = linkify(message);
        messageElement.innerHTML = `${sender}: ${message}`; // Use innerHTML to parse links
    } else {
        messageElement.textContent = `${sender}: ${message}`; // User messages stay plain text
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
}

// Initialize chat
(async () => {
    let sessionId = null;
    try {
        sessionId = await createChatSession(); // Create a chat session on page load
    } catch (error) {
        alert('Failed to create chat session');
    }

    const sendBtn = document.getElementById('sendBtn');
    const queryInput = document.getElementById('queryInput');
    const chatBox = document.getElementById('chatBox');

    // Handle query submission
    sendBtn.addEventListener('click', async () => {
        const query = queryInput.value.trim();
        if (!query) return;

        addToChatBox('You', query);
        queryInput.value = ''; // Clear the input field

        try {
            const response = await submitQuery(sessionId, query);
            console.log('Full API Response:', response); // Log the full response for debugging

            // Add formatted response from GPT to the chat box
            addToChatBox('GPT', response.data.answer); // Adjust this based on the actual API response structure
        } catch (error) {
            addToChatBox('Error', 'Failed to get a response from GPT.');
        }
    });
})();
