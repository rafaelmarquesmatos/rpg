import type { Mensagem, RespostaProvedor } from "./Interfaces.js"
import ferramentas from "../json/ferramentas.json" with { type: "json" }

export default class Provedor {
    /**
     * * perguntar(mensagem: Mensagem[]) recebe um array de objetos Mensagem.
     * * Promise<RespostaProvedor> indica que a função retornará uma respostaProvedor de forma assíncrona.
     * @param mensagem 
     * @returns 
     */
    async perguntar(mensagem: Mensagem[]): Promise<RespostaProvedor> {
        const mensagens = mensagem.map((m) => this.montarMensagem(m))
        
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

                //monta os dados que serão enviados para a IA, converte esse objeto JS em JSON e coloca no corpo da requisição HTTP.
                body: JSON.stringify({
                    model: 'inception/mercury-2.5', // determina o modelo que irá processar a requisição

                    /*
                    * Pega cada mensagem com o modelo de dados interno do programa,
                    * transforma em um formato de dados da API externa e coloca em um novo array
                    * que será convertido em JSON.
                    */
                    messages: mensagens,
                    tools: [ferramentas]
                })
            }
        )

        // se a resposta falhou, lança o erro para quem chamou perguntar()+
        if (!resposta.ok) {
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

    montarMensagem(m: Mensagem) {
        if (m.papel === "usuario") {
            return { role: "user", content: m.conteudo ?? "" }
        }

        if (m.papel === "sistema") {
            return { role: "system", content: m.conteudo ?? ""}
        }
        
        if (m.papel === "ferramenta") {
            return { role: "tool", tool_call_id: m.IdChamada ?? "", content: m.conteudo ?? "" }
        }

        if (m.chamadas) {
            const tool_calls = m.chamadas.map((c) => ({
                id: c.id,
                type: "function" as const,
                function: {
                    name: c.nome,
                    arguments: JSON.stringify(c.argumentos)
                }
            }))

            return { role: "assistant", content: null, tool_calls }
        }

        return { role: "assistant", content: m.conteudo ?? "" }
    }
}