(function() {
    const ikigaiApp = {
        init: function() {
            const chatMessages = document.getElementById('chat-messages');
            const userMessageInput = document.getElementById('user-message');
            const sendButton = document.getElementById('send-button');
            const darkModeToggle = document.getElementById('dark-mode-toggle');

            const questions = [
                "What activities make you lose track of time?",
                "What are some skills or talents you excel at?",
                "What values or causes matter most to you?",
                "What change would you like to bring to the world?",
                "What would you do if money wasn't a concern?"
            ];

            let currentQuestionIndex = 0;
            let userResponses = [];
            let isProcessing = false;

            function addMessage(message, isUser = false) {
                console.log(`Adding message: ${message}`);
                const messageElement = document.createElement('div');
                messageElement.textContent = message;
                messageElement.classList.add('message', isUser ? 'user-message' : 'ai-message');
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            function askNextQuestion() {
                if (currentQuestionIndex < questions.length) {
                    addMessage(questions[currentQuestionIndex]);
                } else if (!isProcessing) {
                    isProcessing = true;
                    addMessage("Thank you for answering all the questions. I'm now processing your Ikigai...");
                    sendToBackend(userResponses);
                }
            }

            async function sendToBackend(responses) {
                try {
                    console.log('Sending responses to backend:', responses);
                    const response = await fetch('http://localhost:3000/api/process-ikigai', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ responses }),
                    });
                    const data = await response.json();
                    console.log('Received response from backend:', data);
                    
                    if (data.summary) {
                        addMessage("Here's a brief summary of your Ikigai:");
                        addMessage(data.summary);
                    }
                    
                    if (data.detailed_report) {
                        addMessage("Here's a detailed analysis of your Ikigai:");
                        addMessage(data.detailed_report);
                    }

                    isProcessing = false;
                } catch (error) {
                    console.error('Error:', error);
                    addMessage("Sorry, there was an error processing your Ikigai. Please try again later.");
                    isProcessing = false;
                }
            }

            function sendMessage() {
                if (isProcessing) return;
                
                const message = userMessageInput.value.trim();
                if (message) {
                    console.log(`User message: ${message}`);
                    addMessage(message, true);
                    userMessageInput.value = '';
                    userResponses.push(message);
                    currentQuestionIndex++;
                    askNextQuestion();
                }
            }

            function toggleDarkMode() {
                document.body.classList.toggle('dark-mode');
            }

            sendButton.addEventListener('click', sendMessage);
            userMessageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            darkModeToggle.addEventListener('click', toggleDarkMode);

            // Initial greeting and first question
            addMessage("Welcome to Ikiguy! I'm here to help you discover your purpose. Let's begin with a few questions.");
            askNextQuestion();
        }
    };

    document.addEventListener('DOMContentLoaded', ikigaiApp.init);
})();