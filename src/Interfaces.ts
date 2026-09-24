interface Chamada{
    id: string,
    nome: string,
    argumentos: Record<string, unknown>
}

interface Mensagem {
    papel: 'sistema' | 'usuario' | 'assistente' | 'ferramenta'
    conteudo?: string
    chamadas?: Chamada[]
    IdChamada?: string
}

interface ChamadaFerramenta {
    id: string,
    type: 'function'
    function: {
        name: string,
        arguments: string
    }
}

interface RespostaProvedor {
    choices: Array<{ message: { content: string | null, tool_calls?: ChamadaFerramenta[]}}>
}

export type { RespostaProvedor }
export type { Mensagem }