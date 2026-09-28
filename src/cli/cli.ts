import { Input } from "./input.js"
import { Output } from "./output.js"
import { Comandos } from "./comandos.js"
import Orquestrador from "../core/Orquestrador.js";
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
                const comando = Comandos.identificador(entrada)
                if( comando ){
                    switch( comando ){
                        case "sair":
                            return
                        case "ajuda":
                            output.sistema("Comandos disponiveis: /ajuda, /sair, /limpar, /debug, /!debug")
                            continue
                        case "desconhecido":
                            output.erro(`Comando não reconhecido: ${entrada}`)
                            continue
                        case "limpar":
                            output.limparTerminal()
                            continue
                        //! nao aguentava mais abrir aquela segunda janela toda hora
                        case "debug":
                            Debug.iniciar()
                            continue
                        case "!debug":
                            Debug.fechar()
                            continue
                    }
                }
                

                //*exibe a entrada do usuario
                output.usuario(entrada)


                /**
                 * Pausamos o Input enquanto o agente trabalha.
                 *
                 * Isso evita que outra entrada seja processada
                 * durante uma execução assíncrona.
                */
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