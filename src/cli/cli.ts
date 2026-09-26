import Orquestrador from "../core/Orquestrador.js";
import { Input } from "./input.js"
import { Output } from "./output.js"
import Debug from "../core/debug/Debug.js"
import Ferramentas from "../core/Ferramentas.js";

// !tirei os prints de terminal do orquestrador e joguei para ser excluivo de cli, mantendo os debug la
export async function iniciar() {
    //* Instancia as calsses Input e Output
    const input = new Input()
    const output = new Output()
    const orquestrador = new Orquestrador(
        "25-09-18-26-ibrprz",
        (evento) => {
            if(evento.tipo === "ferramentas"){
                output.ferramenta(evento.nome)
            }
        }
    )

    while (true) {
        output.prompt()
        
        const entrada = await input.receberMensagem()

        //* condição de parada, pq o tinha o rl.close mas o loop nunca cessava
        if( entrada === "/sair" ){
            break
        }

        const resposta = await orquestrador.receberMensagem(entrada)
        
        output.resposta(resposta)
    }

    Debug.fechar()
    input.fechar()
}