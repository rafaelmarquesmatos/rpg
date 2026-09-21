interface Mensagem {
    papel: 'sistema' | 'usuario' | 'assistente',
    conteudo: string
}

interface RespostaProvedor {
    choices: Array<{ message: { content: string }}>
}

export type { RespostaProvedor }
export type { Mensagem }