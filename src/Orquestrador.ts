import type { Mensagem } from "./Interfaces.js";
import Provedor from "./Provedor.js";
import Transcritor from "./Transcritor.js";

export default class Orquestrador {
    mensagem: Mensagem
    transcritor: Transcritor
    provedor: Provedor

    constructor(mensagem: Mensagem) {
        this.mensagem = mensagem
        this.transcritor = new Transcritor()
        this.provedor = new Provedor()

        this.executar();
    }

    salvarMensagem() {
        this.transcritor.adicionar(this.mensagem)
    }

    async perguntarProvedor() {
        return await this.provedor.perguntar(this.transcritor.receber())
    }

    async executar() {
        this.salvarMensagem()
        const resposta = await this.perguntarProvedor()
        this.transcritor.adicionar({ papel: 'assistente', conteudo: resposta.choices[0]?.message.content!})
        //console.log(resposta.choices[0]?.message.content)
        console.log(this.transcritor.receber())
    }
}