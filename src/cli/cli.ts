import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import Orquestrador from "../Orquestrador.js";

export async function iniciar() {
    const rl = createInterface({ input, output })

    while (true) {
        const conteudo = await rl.question("")

        const construtor = new Orquestrador({
            papel: 'usuario',
            conteudo
        })
    }

    rl.close()
}