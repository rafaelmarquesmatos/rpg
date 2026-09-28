import { clear } from "node:console"
import type { iniciar } from "./cli.js"

export class Output {
    //*começando a colocar fru fru no terminal
    
    //*Sabe se o spinner ta ativo
    private processando = false               
    
    //* guarda o timer criado pelo setInterval                          
    private intervalo: ReturnType<typeof setInterval> | undefined
    
    //* qual animação mostrar
    private quadro = 0

    usuario(conteudo: string){
        process.stdout.write("\x1b[2J\x1b[3J\x1b[H")
        console.log(`[USUARIO]\n\n${conteudo}\n`)
    }

    resposta(conteudo: string) {
        this.finalizarProcessamento()

        console.log(`[FEITICO] ${conteudo}`)
        console.log()
    }

    sistema(conteudo: string) {
        process.stdout.write("\x1b[2J\x1b[3J\x1b[H")

        console.log(`\n[SISTEMA] ${conteudo}\n`)
    }

    ferramenta(nome: string) {
        this.finalizarProcessamento()

        console.log(`[MEMORIA]\n\n${nome}\n`)

        this.iniciarProcessamento
    }

    erro(conteudo: string) {
        this.finalizarProcessamento()
        //? apaga tudo do terminal e bota no inicio acho q seria uma boa pro debug ja que ele exibe um array que vai sendo incrementado com o JSON
        process.stdout.write("\x1b[2J\x1b[3J\x1b[H")

        console.error(`\n[ERRO] ${conteudo}\n`)
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

    limparTerminal(){
        process.stdout.write("\x1b[2J\x1b[3J\x1b[H")
    }
}