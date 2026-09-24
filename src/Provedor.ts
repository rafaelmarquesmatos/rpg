import type { Mensagem, RespostaProvedor } from "./Interfaces.js";

export default class Provedor {
    async perguntar(mensagem: Mensagem[]): Promise<RespostaProvedor> {
        const resposta = await fetch('https://openrouter.ai/api/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    model: 'inception/mercury-2.5',
                    messages: mensagem.map((m) => ({
                        role: m.papel === "usuario" ? "user" : m.papel === "assistente" ? "assistant" : "system",
                        content: m.conteudo,
                    })),
                    tools: [
                        {
                            type: "function",
                            function: {
                                name: "rolarDado",
                                description: "Rola um dado",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        faces: { "type": "number" }
                                    }
                                }
                            }
                        }
                    ]
                })
            }
        )

        if (!resposta.ok) {
            throw new Error(`OpenRouter ${resposta.status}: ${await resposta.text()}`);
        }

        return await resposta.json() as RespostaProvedor;
    }
}