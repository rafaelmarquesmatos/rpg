import type { iniciar } from "./cli.js"

export class Output {
    //*começando a colocar fru fru no terminal
    
    //*Sabe se o spinner ta ativo
    private processando = false               
    
    //* guarda o timer criado pelo setInterval                          
    private intervalo: ReturnType<typeof setInterval> | undefined
    
    //* qual animação mostrar
    private quadro = 0
    //*padroniza a exibição no terminal
    private secao( titulo: string, conteudo: string ){
        console.log(`[${titulo}]`)
        console.log()
        console.log(conteudo)
        console.log()
    }

    iniciarTurno(){
        this.finalizarProcessamento()

        process.stdout.write("\x1b[2J\x1b[3J\x1b[H")

        console.log("=====================================================================")
        console.log("                         RPG AGENT")
        console.log("=====================================================================")
        console.log()
    }

    limparLinha(){
        process.stdout.write("\r\x1b[K")
    }

    usuario(conteudo: string){
        this.secao("USUARIO", conteudo)
    }

    resposta(conteudo: string) {
        this.finalizarProcessamento()
        this.secao("FEITICO", conteudo)
    }

    sistema(conteudo: string) {
        this.secao("SISTEMA", conteudo)
    }

    ferramenta(nome: string) {
        this.finalizarProcessamento()
        this.secao("MEMORIA", nome)
        this.iniciarProcessamento()
    }

    erro(conteudo: string) {
        this.finalizarProcessamento()
        this.secao("ERRO", conteudo)
    }

    iniciarProcessamento(){
        //*impede criar duas animações simuntaneas
        if(this.processando) return

        this.processando = true

        //*primeiro frame da animação
        this.quadro = 0

        //*frames da animação
        const quadros = ["",".","..","..."]

        this.intervalo = setInterval(() =>{
            process.stdout.write(`\r\x1b[K[SISTEMA] Processando${quadros[this.quadro]}`)      //*"\r" retorna a mensagem na mesma linha

            this.quadro++
            //
            if(this.quadro >= quadros.length){
                this.quadro = 0
            }

        }, 300)
    }
    finalizarProcessamento(){
        if( !this.processando ) return

        this.processando = false

        if( this.intervalo !== undefined ){
            //*encerra o temporizador
            clearInterval(this.intervalo)
            
            //*indica que não tem mais temporizador ativo
            this.intervalo = undefined
        }

        //*volta para o inicio da linha e apaga o conteudo dela
        process.stdout.write("\r\x1b[K")
    }
}