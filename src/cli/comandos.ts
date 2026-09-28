export type Comando = "sair" | "ajuda" | "desconhecido"

export class Comandos{

    static identificaodr(entrada: string): Comando | undefined{
        const texto = entrada.trim()

        if( !texto.startsWith("/") ){
            return undefined
        }

        switch( texto ){
            case "/sair":
                return "sair"

            case "/ajuda":
                return "ajuda"

            default:
                return "desconhecido"
        }

    }

    static ehComando(entrada: string) : boolean{
        return entrada.startsWith("/")
    }
}