import { Input } from "./input.js"
import { Output } from "./output.js"
import { Comandos } from "./comandos.js"
import Orquestrador from "../core/Orquestrador.js";
import Ferramentas from "../core/Ferramentas.js";
import Debug from "../core/debug/Debug.js"

// !tirei os prints de terminal do orquestrador e joguei para ser excluivo de cli, mantendo os debug la
export async function iniciar() {
    //* Instancia as calsses Input e Output
    const input = new Input()
    const output = new Output()
    const orquestrador = new Orquestrador(
        "25-09-18-26-ibrprz",
        (evento) => {
            switch( evento.tipo ){
                case "inicio":
                    output.iniciarProcessamento()
                    break
                case "ferramenta":
                    output.ferramenta(evento.nome)
                    break
                case "fim":
                    output.finalizarProcessamento()
                    break
            }
        }
    )

    output.limparTerminal()

    try{        //*se o loop fechar inesperadamente garante que os recusos serão fechados
        while (true) {
                const entrada = await input.receberMensagem()

                //* gancho para implementar comandos mais elaborados
                const comando = Comandos.identificaodr(entrada)
                if( comando ){
                    switch( comando ){
                        case "sair":
                            return
                        case "ajuda":
                            output.sistema("Comandos disponiveis: /ajuda, /sair")
                            continue
                        case "desconhecido":
                            output.erro(`Comando não reconhecido: ${entrada}`)
                            continue
                    }

                    break
                }
                

                //*exibe a entrada do usuario
                output.usuario(entrada)

                input.pausar()

                try{    //* trata o erro de um mensagem individual                                                                
                    const resposta = await orquestrador.receberMensagem(entrada)

                    output.resposta(resposta)
                }
                catch( erro ){
                    if( erro instanceof Error ){            //* verifica se o objeto armazenado em erro é uma instancia de Error
                        output.erro(erro.message)
                    }
                    else{
                        output.erro(String(erro))           //* converte o valor para string caso nao for
                    }
                }
                finally{
                    input.retomar()
                }
                
            }
    }
    finally{
        Debug.fechar()
        input.fechar()
    }
}