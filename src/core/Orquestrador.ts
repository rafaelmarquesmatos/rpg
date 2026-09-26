import Ferramentas from "../core/Ferramentas.js";                             //ações que a IA pode solicitar
import Debug from "./debug/Debug.js";
import type { IdConversa, Mensagem, RespostaProvedor } from "./Interfaces.js";      //formato dos dados
import Provedor from "./Provedor.js";                                   //comunicação com o provedor
import Transcritor from "./Transcritor.js";                             //historico de conversas e mensagens

export default class Orquestrador {
    transcritor: Transcritor            //classe responsável pelo contexto.
    provedor: Provedor                  //classe responsável por conversar com o modelo de IA.
    ferramentas: Ferramentas
    mensagem: Mensagem            //classe statica responsável por executar ações solicitadas pelo modelo.
    log: boolean

    constructor(idConversa?: IdConversa) {
        this.transcritor = new Transcritor(idConversa)
        this.provedor = new Provedor()
        this.ferramentas = new Ferramentas()

        this.mensagem = {
            papel: 'usuario'
        }

        this.log = true
    }

    // * Função responsavel por receber a mensagem do usuario
    public async receberMensagem(conteudo: string) {
        this.mensagem = {
            papel: "usuario",
            conteudo
        }

        Debug.print(`Mensagem do usuario: ${conteudo}`)

        return await this.executar()
    }

    // * Função responsavel por salvar a mensagem do usuario a cada interação
    private salvarMensagem() //usa o metodo do transcritor para armazenar a mensagem que o Orquestrador recebeu no transcritor
    {
        this.transcritor.adicionar(this.mensagem)
        Debug.print(`Salvando no transcritor: ${JSON.stringify(this.mensagem, null, 2)}`)
    }

    // * Função responsavel por encaminhar o contexto atual para o provedor e esperar uma resposta
    private async perguntarProvedor() {
        const respostaProvedor = await this.provedor.perguntar(this.transcritor.receber())
        return respostaProvedor
        /*
            *(this.provedor.perguntar) pede o historico ao transcritor e faz a requisição HTTP para a API
            *(this.transcritor.receber()) fornece o historico de mensagen para o provedor
            *(await) faz esperar ja que a requisição pode demorar
        */
    }

    // ! tentar tirar o maximo possivel de ? e !
    private registrarResposta(resposta: RespostaProvedor) //Receber a resposta do Provedor, extrair a mensagem da IA, salvar essa mensagem no histórico e verificar se a IA pediu alguma ferramenta.
    {
        const mensagem = resposta.choices[0]?.message
        /*
            (resposta.choices[0]) pega o primeiro elemento do array choices
            (.message) declara para pegar o content do array
        */


        // ! precisa de uma melhoria aqui
        this.transcritor.adicionar({        // guarda o texto do assistente
            papel: 'assistente',            //role: assistant
            conteudo: mensagem?.content!,   //"!" declara que sabemos que não sera null, confia...
            ...(mensagem?.tool_calls
                ? {
                    chamadas: mensagem.tool_calls.map((c) => ({
                        id: c.id,
                        nome: c.function.name,
                        argumentos: JSON.parse(c.function.arguments) as Record<string, unknown>,
                    })),
                }
                : {}),
        })

        if (mensagem?.content) {
            console.log(mensagem?.content) //exibe a resposta do assistente (IA)
            Debug.print(`Resposta do assistente: ${mensagem?.content}`)
        }

        if (mensagem?.tool_calls) {
            // TODO: Atualmente registrarResposta tá chamando o registrarFerramenta para ver se tem uma ferramenta e não tem muito sentido kkk
            this.registrarFerramenta(mensagem)
            return true      // se o modelo pediu uma ferramenta, executa e guarda o resultado
        }

        return false
    }

    // ! tentar tirar o maximo possivel de ? e !
    private registrarFerramenta(mensagem: RespostaProvedor["choices"][number]["message"] | undefined) {
        const chamada = mensagem?.tool_calls?.[0]       //armazena a primeira chamada de tool_calls
        if (!chamada) return
        
        const nome = chamada.function.name;

        //se chamada for false encerra o metodo
        //verifica se a chave usada para chamar a ferramenta existe em ferramentas e afirma que nao var ser undefined
        if (!(nome! in Ferramentas.funcoes)) return "ferramenta invalida :("

        //passa os parametros de execução da ferramenta e se der tudo certo armazena na variavel
        const resultadoFerramenta = this.ferramentas.executarFuncao(
            chamada.function.name,
            chamada.function.arguments,
            chamada.id
        )

        Debug.print(`Resultado da chamada de ferramentas ${resultadoFerramenta?.resultado}`)

        this.transcritor.adicionar({        //chama o transcritor para armazenar esse resultado no contexto
            papel: 'ferramenta',
            conteudo: resultadoFerramenta?.resultado!,
            IdChamada: chamada.id
        })

        Debug.print(JSON.stringify(mensagem?.tool_calls, null, 2))
    }

    // * Responsavel por executar toda a sequencia de interações 
    private async executar(): Promise<string> {
        // Salvamos a mensagem do usuario
        this.salvarMensagem()

        let ultima

        while (true) {
            const resposta = await this.perguntarProvedor()
            const temFerramenta = this.registrarResposta(resposta)
            
            ultima = resposta

            if (!temFerramenta) break
        }

        Debug.print('While do orquestrador finalizado', true)
        return ultima.choices[0]?.message.content!
    }
}