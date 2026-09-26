/**
 ** Record<string, unknown>" passa como parametro uma mensagen com nome e valor qualquer"=> string" retorna uma string
 */
type Ferramenta = (args: Record<string, unknown>) => string
//declara as ferramentas disponoveis para uso
type MinhasFerramentas = {
    rolarDado: Ferramenta
    soma: Ferramenta
}

export default class Ferramentas {
    static funcoes: MinhasFerramentas = {
        rolarDado: (args): string => {
            const faceMaxima = args.faces

            if (typeof (faceMaxima) !== "number") return "o argumento precisa ser numerico"
            return (Math.floor(Math.random() * faceMaxima) + 1).toString()
        },
        soma: (args): string => {
            const n1 = args.n1
            const n2 = args.n2

            if (typeof (n1) !== "number" || typeof (n2) !== "number") return "ambos os argumentos precisam ser numericos"

            return (n1 + n2).toString()
        }
    }

    /**
     * *função principal que executa funções pedidas pelo assistente
     * @param nome nome da função que vai ser executada caso ela exista como parametro no objeto de funções
     * @param argumentos argumentos que serão usados pela função que será executada
     * @param id id unico da função
     * @returns Caso o @param nome exista no objeto de funções o retorno será uma @string caso ao contrario um @void
     */
    executarFuncao(nome: string, argumentos: string, id: string): Record<string, string> | void {
        /** valida se o @param nome passado é uma chave de Ferramentas.funcoes */
        if (!(nome in Ferramentas.funcoes)) return

        //*  uma maneira mais controlada
        let args: Record<string, unknown>
        try{
            args = JSON.parse(argumentos)
        }
        catch{
            return{
                resultado: "Os argumentos da ferramenta não possuem um JSON válido",
                id
            }
        }

        //!const args = JSON.parse(argumentos). Dessa forma um JSON invalido encerrava o processo

        return { resultado: Ferramentas.funcoes[nome as keyof MinhasFerramentas](args), id }
    }
}