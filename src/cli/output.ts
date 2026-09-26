export class Output {
    resposta(conteudo: string) {
        console.log(`[Feitiço]: ${conteudo}`)
    }

    sistema(conteudo: string) {
        console.log(`[SISTEMA] ${conteudo}`)
    }

    ferramenta(nome: string) {
        console.log(`[FERRAMENTA] ${nome}`)
    }

    erro(conteudo: string) {
        console.error(`[ERRO] ${conteudo}`)
    }
}