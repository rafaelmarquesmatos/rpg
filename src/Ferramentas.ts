type Ferramenta = (args: Record<string, unknown>) => string
type MinhasFerramentas = {
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

    executarFuncao(nome: keyof MinhasFerramentas, argumentos: string, id: string) {
        if (!(nome in Ferramentas.funcoes) && nome !== undefined) return

        const args = JSON.parse(argumentos)
        return { resultado: Ferramentas.funcoes[nome](args), id }
        // return Ferramentas.funcoes[nome](args) + ' ' + id
    }
}