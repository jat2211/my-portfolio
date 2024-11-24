class OllamaClient {
    constructor() {
        this.baseUrl = 'http://localhost:11434';
        this.model = 'jaybo';
    }

    async *streamChat(message, history = []) {
        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: history,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from Ollama');
            }

            const reader = response.body.getReader();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    const data = JSON.parse(line);
                    if (data.message?.content) {
                        yield data.message.content;
                    }
                }
            }
        } catch (error) {
            console.error('Ollama chat error:', error);
            throw error;
        }
    }
}

module.exports = { OllamaClient };
