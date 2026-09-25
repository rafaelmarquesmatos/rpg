type Ferramenta = (args: Record<string, unknown>) => string
    /* 
        "Record<string, unknown>" passa como parametro uma mensagen com nome e valor qualquer
        "=> string" retorna uma string
    */
type MinhasFerramentas = {      //declara as ferramentas disponoveis para uso
    rolarDado: Ferramenta
}

export default class Ferramentas {
    static funcoes: MinhasFerramentas = {
        rolarDado: (args): string => {       
            const faceMaxima = args.faces

            if (typeof (faceMaxima) !== "number") return "os argumentos precisam ser ambos numericos"
            return (Math.floor(Math.random() * faceMaxima) + 1).toString()
        }
    }

    executarFuncao(nome: string, argumentos: string, id: string) {      //função aceita qualquer valor de string 
        if (!(nome in Ferramentas.funcoes)) return      //valida se o parametro passado é uma propriedade com esse nome dentro de Ferramentas.funcoes

        const args = JSON.parse(argumentos)     //transforma os argumentos de string para objeto JS

        return { resultado: Ferramentas.funcoes[nome as keyof MinhasFerramentas](args), id }
        // return Ferramentas.funcoes[nome](args) + ' ' + id
    }
}