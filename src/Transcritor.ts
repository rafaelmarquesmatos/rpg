import type { Mensagem } from "./Interfaces.js";        //formato de mensagem que ira transcrever

export default class Transcritor {
    static estados: Mensagem[] = []     //"declara um array vazio estatico chamdo estado que segue opadrõa estabelecido em Mensagem "

    adicionar(mensagem: Mensagem){              //recebe uma mensagem como parametro
        Transcritor.estados.push(mensagem);     //armazena essa mensgen no mesmo array
    }

    receber() {
        return Transcritor.estados      //retorna o array
    }
}