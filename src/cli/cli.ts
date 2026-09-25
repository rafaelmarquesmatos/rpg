import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import Orquestrador from "../core/Orquestrador.js";

export async function iniciar() {
    const rl = createInterface({ input, output })

    const orquestrador = new Orquestrador("25-09-18-26-ibrprz")

    while (true) {
        orquestrador.receberMensagem(await rl.question(""))
    }

    rl.close()
}