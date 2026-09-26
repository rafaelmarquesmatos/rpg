import Ferramentas from "../core/Ferramentas.js";                             //ações que a IA pode solicitar
import Debug from "./debug/Debug.js";
import type { IdConversa, Mensagem, RespostaProvedor, EventoOrquestrador } from "./Interfaces.js";      //formato dos dados
import Provedor from "./Provedor.js";                                   //comunicação com o provedor
import Transcritor from "./Transcritor.js";  

export default class Orquestrador {
    transcritor: Transcritor            //classe responsável pelo contexto.
    provedor: Provedor                  //classe responsável por conversar com o modelo de IA.
    ferramentas: Ferramentas
    mensagem: Mensagem            //classe statica responsável por executar ações solicitadas pelo modelo.
    log: boolean
    private observador?: (evento: EventoOrquestrador) => void | undefined

    constructor(
        idConversa?: IdConversa,
        observador?: (evento: EventoOrquestrador) => void
    ) {
        this.transcritor = new Transcritor(idConversa)
        this.provedor = new Provedor()
        this.ferramentas = new Ferramentas()

        this.mensagem = {
            papel: 'usuario'
        }

        this.log = true

        if(observador){
            this.observador = observador
        }
    }

    // * Função responsavel por receber a mensagem do usuario
    public async receberMensagem(conteudo: string) {        //* assicrono pq execultar iniciava de forma assincrona mas receberMenssahem não esperava por ela
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
        /*
            *(resposta.choices[0]) pega o primeiro elemento do array choices
            *(.message) declara para pegar o content do array
        */
        const mensagem = resposta.choices[0]?.message
        if(!mensagem) return    //* se não houver mensagen retorna. ajuda a tirar parte dos "?"
        
        // * monta uma mensagen e salva no transcritor
        this.transcritor.adicionar({
            papel: 'assistente',

            //*esse trecho trata caso o provedor retorne uma mensagen com content null ou sem tool_calls
            ...(mensagem.content? {conteudo: mensagem.content} : {}),                             
                            //* if          {true}          else {false}
            ...(mensagem.tool_calls? {
                    chamadas: mensagem.tool_calls.map((c) => ({
                        id: c.id,
                        nome: c.function.name,
                        argumentos: JSON.parse(c.function.arguments) as Record<string, unknown>,
                    })),
                }
            : {}),
})
        /**
         * // ! precisa de uma melhoria aqui
         */
        
        if (mensagem.content) {
            Debug.print(`Resposta do assistente: ${mensagem.content}`)    
        }
        
        if (mensagem.tool_calls?.[0]) {
            // TODO: Atualmente registrarResposta tá chamando o registrarFerramenta para ver se tem uma ferramenta e não tem muito sentido kkk
            this.registrarFerramenta(mensagem)
            return true      // se o modelo pediu uma ferramenta, executa e guarda o resultado
        }

        return false
    }

    // ! tentar tirar o maximo possivel de ? e !
    private registrarFerramenta(mensagem: RespostaProvedor["choices"][number]["message"]) {
        const chamada = mensagem.tool_calls?.[0]       //armazena a primeira chamada de tool_calls existindo ou não
        //*se chamada for undefined encerra, reduz redundancia
        if (!chamada) return

        const nome = chamada.function.name;
        //*verifica se a chave usada para chamar a ferramenta existe em ferramentas 
        if (!(nome in Ferramentas.funcoes)) return

        this.observador?.({
            tipo: 'ferramentas',
            nome
        })

        //passa os parametros de execução da ferramenta e se der tudo certo armazena na variavel
        const resultadoFerramenta = this.ferramentas.executarFuncao(
            nome,
            chamada.function.arguments,
            chamada.id
        )
        if(!resultadoFerramenta) return //*"Ferramenta não execultada"

        Debug.print(`Resultado da chamada de ferramentas ${resultadoFerramenta.resultado}`)

        this.transcritor.adicionar({        //chama o transcritor para armazenar esse resultado no contexto
            papel: 'ferramenta',
            conteudo: resultadoFerramenta.resultado!,
            IdChamada: chamada.id
        })

        Debug.print(JSON.stringify(mensagem.tool_calls, null, 2))
    }

    // * Responsavel por executar toda a sequencia de interações 
    private async executar() {
        // Salvamos a mensagem do usuario
        this.salvarMensagem()

        while (true) {
        
            const resposta = await this.perguntarProvedor()
            const temFerramenta = this.registrarResposta(resposta)

            if (!temFerramenta){
                Debug.print("While do orquestrador finalizado", true)  // * è aqui chefe, fora do if tava tava dentro do loop
                
                return resposta.choices[0]?.message.content ?? " ";
            } 
        }
    }

   
}