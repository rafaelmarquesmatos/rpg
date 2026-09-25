import type { KeyObject } from "node:crypto";
import Ferramentas from "./Ferramentas.js";                             //ações que a IA pode solicitar
import type { Mensagem, RespostaProvedor } from "./Interfaces.js";      //formato dos dados
import Provedor from "./Provedor.js";                                   //comunicação com o provedor
import Transcritor from "./Transcritor.js";                             //historico de conversas e mensagens

export default class Orquestrador {
    mensagem: Mensagem                  //representa a mensagem recebida.
    transcritor: Transcritor            //objeto responsável pelo histórico.
    provedor: Provedor                  //objeto responsável por conversar com o modelo de IA.
    ferramentas: Ferramentas            //objeto responsável por executar ações solicitadas pelo modelo.

    constructor(mensagem: Mensagem)  //construtor recebe um objeto de acordo com o formato de Mensagen
    {  
        this.mensagem = mensagem
        this.transcritor = new Transcritor()
        this.provedor = new Provedor()
        this.ferramentas = new Ferramentas()

        this.executar();
    }

    salvarMensagem() //usa o metodo do transcritor para armazena a mensagem que o Orquestrador recebeu no trasncritor
    {
        this.transcritor.adicionar(this.mensagem)      
    }

    async perguntarProvedor() {
        return await this.provedor.perguntar(this.transcritor.receber())
        /*
            *(this.provedor.perguntar) pede o historico ao transcritor e faz a requisição HTTP para a API
            *(this.transcritor.receber()) fornece o historico de mensagen para o provedor
            *(await) faz esperar ja que a requisição pode demorar
        */
    }
    
    async executar() // guarda a fala do usuario e pede a resposta
    {
        this.salvarMensagem()   //guarda a mensagem do usuario
        const resposta = await this.perguntarProvedor() //pega o historico e manda para IA, quando a IA responder esse resultado vai para (resposta)
        this.registrarResposta(resposta)    //entrega para ser processada
    }

    registrarResposta(resposta: RespostaProvedor) //Receber a resposta do Provedor, extrair a mensagem da IA, salvar essa mensagem no histórico e verificar se a IA pediu alguma ferramenta.
    {
        const mensagem = resposta.choices[0]?.message
            /*
                (resposta.choices[0]) pega o primeiro elemento do array choices
                (.message) declara para pegar o content do array
                (?) proteje caso seja undefined
            */

         
        this.transcritor.adicionar({        // guarda o texto do assistente
            papel: 'assistente',            //role: assistant
            conteudo: mensagem?.content!    //"!" declara que sabemos que não sera null, confia...
        })
        console.log(mensagem?.content)              //exibe a resposta do assistente (IA)
        console.log(this.transcritor.receber())     //exibe o historico de mensagens

        this.registrarFerramenta(mensagem)      // se o modelo pediu uma ferramenta, executa e guarda o resultado
    }

    registrarFerramenta(mensagem: RespostaProvedor["choices"][number]["message"] | undefined) {
        const chamada = mensagem?.tool_calls?.[0]       //armazena em chamda a primeira chamda de tool_calls se houver
        const nome = chamada?.function.name;
        
        if (!chamada) return        //se chamada for false encerra o metodo
        if ( !(nome! in Ferramentas.funcoes) ) return "ferramenta invalida :("     //verifica se a chave usada para chamar a ferramenta existe em ferramentas e afirma que nao var ser undefined

        const resultadoFerramenta = this.ferramentas.executarFuncao(        //passa os parammetros de execução do metodo de execução de ferramenta e se tudo for true armazena na variavel
            chamada.function.name,
            chamada.function.arguments,
            chamada.id
        )
        console.log(resultadoFerramenta?.resultado)

        this.transcritor.adicionar({        //chama o transcritor para armazenar esse resultado no historico
            papel: 'ferramenta',
            conteudo: resultadoFerramenta?.resultado!
        })
         console.log(JSON.stringify(mensagem?.tool_calls, null, 2))
    }
}