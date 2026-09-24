import Ferramentas from "./Ferramentas.js";
import type { Mensagem, RespostaProvedor } from "./Interfaces.js";
import Provedor from "./Provedor.js";
import Transcritor from "./Transcritor.js";

export default class Orquestrador {
    mensagem: Mensagem
    transcritor: Transcritor
    provedor: Provedor
    ferramentas: Ferramentas

    constructor(mensagem: Mensagem) {

        this.mensagem = mensagem
        this.transcritor = new Transcritor()
        this.provedor = new Provedor()
        this.ferramentas = new Ferramentas()

        this.executar();
    }

    salvarMensagem() {
        this.transcritor.adicionar(this.mensagem)
    }

    async perguntarProvedor() {
        return await this.provedor.perguntar(this.transcritor.receber())
    }

    async executar() {
        // guarda a fala do usuario e pede a resposta
        this.salvarMensagem()
        const resposta = await this.perguntarProvedor()
        this.registrarResposta(resposta)
    }

    registrarResposta(resposta: RespostaProvedor) {
        const mensagem = resposta.choices[0]?.message

        // guarda o texto do assistente
        this.transcritor.adicionar({ papel: 'assistente', conteudo: mensagem?.content! })
        console.log(mensagem?.content)
        console.log(this.transcritor.receber())

        // se o modelo pediu uma ferramenta, executa e guarda o resultado
        this.registrarFerramenta(mensagem)
    }

    registrarFerramenta(mensagem: RespostaProvedor["choices"][number]["message"] | undefined) {
        console.log(JSON.stringify(mensagem?.tool_calls, null, 2))
        const chamada = mensagem?.tool_calls?.[0]
        if (!chamada) return
        if (chamada.function.name !== "rolarDado") return

        const resultadoFerramenta = this.ferramentas.executarFuncao(chamada.function.name, chamada.function.arguments, chamada.id)
        console.log(resultadoFerramenta?.resultado)
        this.transcritor.adicionar({
            papel: 'ferramenta',
            conteudo: resultadoFerramenta?.resultado!
        })
    }
}