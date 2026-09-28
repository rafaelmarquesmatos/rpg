export type Comando = "sair" | "ajuda" | "limpar" | "debug" | "!debug"| "desconhecido"

export class Comandos{

    static identificador(entrada: string): Comando | undefined{
        const texto = entrada.trim()        //*remove os espaçoes antes depois

        if( !texto.startsWith("/") ){
            return undefined
        }

        switch( texto ){
            case "/sair":
                return "sair"

            case "/ajuda":
                return "ajuda"
            case "/limpar":
                return "limpar"
            case "/debug":
                return "debug"
            case "/!debug":
                return "!debug"

            default:
                return "desconhecido"
        }
    }
}