import type { Mensagem } from "./Interfaces.js";

export default class Transcritor {
    static estados: Mensagem[] = [] 

    adicionar(mensagem: Mensagem) {
        Transcritor.estados.push(mensagem);
    }

    receber() {
        return Transcritor.estados
    }
}