import Ferramentas from "../core/Ferramentas.js";                             //ações que a IA pode solicitar
import type { Mensagem, RespostaProvedor } from "./Interfaces.js";      //formato dos dados
import Provedor from "./Provedor.js";                                   //comunicação com o provedor
import Transcritor from "./Transcritor.js";                             //historico de conversas e mensagens

export default class Orquestrador {
    mensagem: Mensagem                  //representa a mensagem recebida pelo usuario.
    transcritor: Transcritor            //classe responsável pelo contexto.
    provedor: Provedor                  //classe responsável por conversar com o modelo de IA.
    ferramentas: Ferramentas            //classe statica responsável por executar ações solicitadas pelo modelo.

    constructor(mensagem: Mensagem) {
        this.mensagem = mensagem
        this.transcritor = new Transcritor()
        this.provedor = new Provedor()
        this.ferramentas = new Ferramentas()

        this.executar();
    }

    // * Função responsavel por salvar a mensagem do usuario a cada interação
    salvarMensagem() //usa o metodo do transcritor para armazenar a mensagem que o Orquestrador recebeu no transcritor
    {
        this.transcritor.adicionar(this.mensagem)
    }

    // * Função responsavel por encaminhar o contexto atual para o provedor e esperar uma resposta
    async perguntarProvedor() {
        return await this.provedor.perguntar(this.transcritor.receber())
        /*
            *(this.provedor.perguntar) pede o historico ao transcritor e faz a requisição HTTP para a API
            *(this.transcritor.receber()) fornece o historico de mensagen para o provedor
            *(await) faz esperar ja que a requisição pode demorar
        */
    }

    registrarResposta(resposta: RespostaProvedor) //Receber a resposta do Provedor, extrair a mensagem da IA, salvar essa mensagem no histórico e verificar se a IA pediu alguma ferramenta.
    {
        const mensagem = resposta.choices[0]?.message
        /*
            (resposta.choices[0]) pega o primeiro elemento do array choices
            (.message) declara para pegar o content do array
        */


        this.transcritor.adicionar({        // guarda o texto do assistente
            papel: 'assistente',            //role: assistant
            conteudo: mensagem?.content!    //"!" declara que sabemos que não sera null, confia...
        })
        console.log(mensagem?.content)              //exibe a resposta do assistente (IA)
        console.log(this.transcritor.receber())     //exibe o historico de mensagens

        // TODO: Atualmente registrarResposta tá chamando o registrarFerramenta para ver se tem uma ferramenta e não tem muito sentido kkk
        this.registrarFerramenta(mensagem)      // se o modelo pediu uma ferramenta, executa e guarda o resultado
    }

    registrarFerramenta(mensagem: RespostaProvedor["choices"][number]["message"] | undefined) {
        const chamada = mensagem?.tool_calls?.[0]       //armazena a primeira chamada de tool_calls
        const nome = chamada?.function.name;

        //se chamada for false encerra o metodo
        if (!chamada) return
        //verifica se a chave usada para chaar a ferramenta existe em ferramentas e afirma que nao var ser undefined
        if (!(nome! in Ferramentas.funcoes)) return "ferramenta invalida :("

        //passa os parametros de execução da ferramenta e se der tudo certo armazena na variavel
        const resultadoFerramenta = this.ferramentas.executarFuncao(
            chamada.function.name,
            chamada.function.arguments,
            chamada.id
        )
        console.log(resultadoFerramenta?.resultado)

        this.transcritor.adicionar({        //chama o transcritor para armazenar esse resultado no contexto
            papel: 'ferramenta',
            conteudo: resultadoFerramenta?.resultado!
        })
        console.log(JSON.stringify(mensagem?.tool_calls, null, 2))
    }

    // * Responsavel por executar toda a sequencia de interações 
    async executar()
    {
        this.salvarMensagem()
        const resposta = await this.perguntarProvedor()
        this.registrarResposta(resposta)
    }
}