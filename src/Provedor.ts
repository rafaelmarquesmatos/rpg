import type { Mensagem, RespostaProvedor } from "./Interfaces.js";

export default class Provedor {
    /*
    * perguntar(mensagem: Mensagem[]) recebe um array de objetos Mensagem.
    * Promise<RespostaProvedor> indica que a função retornará uma
    * RespostaProvedor de forma assíncrona.
    */
    async perguntar(mensagem: Mensagem[]): Promise<RespostaProvedor> {
        const resposta = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            // O fetch() inicia a requisição HTTP e retorna uma Promise<Response>.
            // O await espera essa Promise ser resolvida.
            {
                method: 'POST', // define o método HTTP POST, usado para enviar os dados da requisição à API
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // autentica a requisição usando a chave contida nas variáveis de ambiente
                    'Content-Type': 'application/json', // informa ao servidor que o conteúdo do body está sendo enviado no formato JSON.
                },

                /*
                * Monta os dados que serão enviados para a IA,
                * converte esse objeto JS em JSON e coloca no corpo da requisição HTTP.
                */
                body: JSON.stringify({
                    model: 'inception/mercury-2.5', // determina o modelo que irá processar a requisição

                    /*
                    * Pega cada mensagem com o modelo de dados interno do programa,
                    * transforma em um formato de dados da API externa e coloca em um novo array
                    * que será convertido em JSON.
                    */
                    messages: mensagem.map((m) => ({
                        role:
                            m.papel === "usuario"
                                ? "user"
                                : m.papel === "assistente"
                                ? "assistant"
                                : "system",

                        content: m.conteudo, // pega o conteúdo da mensagem e passa para content
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

        if (!resposta.ok) { // se a resposta falhou, lança o erro para quem chamou perguntar()
            throw new Error(
                `OpenRouter ${resposta.status}: ${await resposta.text()}`
            ); // cria um objeto Error e lança esse erro para quem chamou perguntar()
        }

        return await resposta.json() as RespostaProvedor;
        /*
        * Recebe a resposta HTTP, lê o corpo como JSON,
        * transforma em objeto JS, trata como RespostaProvedor
        * e devolve para quem chamou perguntar().
        */
    }
}