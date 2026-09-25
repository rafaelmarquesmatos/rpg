// Formato de mensagem que ira transcrever
import { gerarIdChat } from "../utils/funcoes.js"
import type { IdConversa, Mensagem } from "./Interfaces.js"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const pasta = path.join(import.meta.dirname, '../../data')

export default class Transcritor {
    private static conversar = new Map<IdConversa, Mensagem[]>()

    id: IdConversa | undefined
    estados: Mensagem[]

    constructor(idConversa?: IdConversa) {
        if (!idConversa) {
            this.id = gerarIdChat()
            this.estados = []
            Transcritor.conversar.set(this.id, this.estados)
            return
        }

        this.id = idConversa
        const existente = Transcritor.conversar.get(idConversa)

        if (existente) {
            this.estados = existente
            return
        }

        this.estados = this.ler()
        Transcritor.conversar.set(idConversa, this.estados)
    }

    private ler(): Mensagem[] {
        if (!this.id) return []
        const caminho = path.join(pasta, `${this.id}.json`)
        if (!existsSync(caminho)) return []
        const dados: unknown = JSON.parse(readFileSync(caminho, "utf8"))
        if (!Array.isArray(dados)) return []
        return dados as Mensagem[]
    }

    private gravar() {
        if (!this.id) return
        mkdirSync(pasta, { recursive: true })
        writeFileSync(
            path.join(pasta, `${this.id}.json`),
            JSON.stringify(this.estados, null, 2),
            "utf8",
        )
    }

    /**
     * * Função que adiciona contexto ao transcritor
     * @param mensagem recebe uma como parametro
     */
    adicionar(mensagem: Mensagem) {
        this.estados.push(mensagem)
        this.gravar()
    }

    // * Função que retorna o estado do transcritor
    receber() {
        return this.estados
    }
}