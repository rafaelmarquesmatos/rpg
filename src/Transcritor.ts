// Formato de mensagem que ira transcrever
import type { Mensagem } from "./Interfaces.js";

export default class Transcritor {
    //declara um array estatico que segue a interface estabelecida em Mensagem
    static estados: Mensagem[] = []

    /**
     * * Função que adiciona contexto ao transcritor
     * @param mensagem recebe uma como parametro
     */
    adicionar(mensagem: Mensagem) {
        Transcritor.estados.push(mensagem);
    }

    // * Função que retorna o estado do transcritor
    receber() {
        return Transcritor.estados
    }
}