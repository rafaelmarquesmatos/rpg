export class Output {

    prompt() {
        process.stdout.write("> ")
    }

    resposta(conteudo: string) {
        console.log("\n[FEITIÇO]")
        console.log(conteudo)
        console.log()
    }

    sistema(conteudo: string) {
        console.log(`\n[SISTEMA] ${conteudo}\n`)
    }

    ferramenta(nome: string) {
        console.log(`\n[FERRAMENTA] ${nome}\n`)
    }

    erro(conteudo: string) {
        console.error(`\n[ERRO] ${conteudo}\n`)
    }
}