import { randomInt } from "node:crypto"
import type { IdConversa } from "../core/Interfaces.js";

const LETRAS = "abcdefghijklmnopqrstuvwxyz"

export function gerarIdChat(agora = new Date()): IdConversa {
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");

    const sufixo = Array.from({ length: 6 }, () => LETRAS[randomInt(LETRAS.length)]).join("")

    return `${dia}-${mes}-${hora}-${minuto}-${sufixo}` as IdConversa
}
