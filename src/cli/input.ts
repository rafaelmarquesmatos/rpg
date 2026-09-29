import { stdin as input, stdout as output } from "node:process"
import { resolve } from "node:dns"

/**
 ** Gerencia a entrada de dados do usuário pelo terminal.
 *
 *! Responsável por:
 ** - receber mensagens;
 ** - pausar e retomar a leitura;
 ** - liberar os recursos utilizados pelo readline.
*/

export class Input{
    /*
     * Guarda temporariamente tudo que o usuário está digitando.
     *
     * Exemplo:
     * tecla "a" → mensagem = "a"
     * tecla "t" → mensagem = "at"
     * tecla "a" → mensagem = "ata"
     *
     * Esse texto só será entregue para a CLI quando o usuário
     * pressionar Enter.
    */
    private mensagem = ""
    /*
     * Guarda a função "resolve" da Promise criada em receberMensagem().
     *
     * A função resolve é responsável por finalizar a Promise e entregar
     * a mensagem para quem fez:
     *
     *      await input.receberMensagem()
     *
     * Enquanto o usuário ainda estiver digitando, essa propriedade fica
     * como undefined porque ainda não temos uma resposta pronta.
     *
     * O | undefined foi declarado explicitamente porque o projeto utiliza
     * "exactOptionalPropertyTypes" no TypeScript.
    */ 
    private resolver?: ((mensagem: string) => void) | undefined
    /*
     * Indica se o Input já registrou o listener do stdin.
     *
     * Isso impede que chamar receberMensagem() várias vezes crie vários
     * listeners para o mesmo teclado.
     */
    private escutando = false
    /*
     * Algumas teclas especiais, como as setas, são enviadas pelo terminal
     * como sequências de caracteres de controle.
     *
     * Exemplo conceitual:
     *
     *      ESC + [ + A
     *
     * O ESC indica que estamos entrando em uma sequência especial.
     * Essa variável registra esse estado.
     *
     * Por enquanto apenas ignoramos essas sequências. Mais tarde podemos
     * usar isso para implementar histórico, movimentação do cursor etc.
     */
    private emSequenciaEscape = false

    /*
     * Inicia uma nova leitura do teclado.
     *
     * A função continua sendo assíncrona para que a CLI possa continuar
     * usando:
     *
     *      const entrada = await input.receberMensagem()
     *
     * Internamente, porém, não usamos mais readline.question().
     * Agora controlamos as teclas diretamente através do stdin.
     */
    async receberMensagem(): Promise<string>{  
         // *Uma nova mensagem sempre começa com um buffer vazio.
        this.mensagem = ""
        
        // *Garante que o stdin esteja configurado para receber teclas.
        this.iniciarLeitura()
        
        // *Desenha o prompt na região de entrada da tela.
        this.mostrarPrompt()


        /*
         * A Promise fica pendente enquanto o usuário está digitando.
         *
         * Guardamos a função resolve para chamá-la posteriormente,
         * quando o usuário pressionar Enter com uma mensagem válida.
         */
        return new Promise((resolve) =>{
            this.resolver = resolve
        })
    }

    /*
     * Configura o stdin para receber as teclas diretamente.
     */
    private iniciarLeitura(){
        /*
         * Se o listener já foi registrado, não precisamos registrá-lo
         * novamente.
         */
        if( this.escutando ) return
           
            //*Converte os dados recebidos pelo stdin para strings UTF-8.
            input.setEncoding("utf8")

            /*
                * setRawMode(true) faz o terminal entregar as teclas diretamente
                * para o programa, em vez de esperar o comportamento tradicional
                * de entrada por linha.
                *
                * Só usamos isso quando o stdin realmente está conectado a um TTY.
            */
            if( input.isTTY ){
                input.setRawMode(true)
            }

             /*
                * Retoma o recebimento de dados pelo stdin.
            */
            input.resume()
            
            /*
                * Sempre que o usuário pressionar uma tecla e o stdin receber dados,
                * nosso método tratarTecla será executado.
            */
            input.on("data", this.tratarTecla)
            
            // *Marca que o listener já está ativo
            this.escutando = true
        }
    
     /*
        * Processa as teclas recebidas do terminal.
        *
        * Um evento "data" pode conter mais de um caractere, por isso percorremos
        * todos os caracteres recebidos.
     */
    private tratarTecla = ( dados: string | Buffer ) =>{
        /*
            * Garantimos que estamos trabalhando com texto.
            *
            * Em vez de manipular diretamente um Buffer, transformamos os dados
            * em uma string.
         */
        const texto = dados.toString()
        
        /*
            * Percorremos cada caractere recebido individualmente.
        */
        for( const tecla of texto ){
             /*
             * Sequências como as setas começam com ESC.
             * Por enquanto ignoramos essas sequências para impedir
             * que caracteres de controle apareçam no texto.
             */
            if( tecla === "\x1b" ){
                this.emSequenciaEscape = true
                continue
            }

            /*
                * Se estamos dentro de uma sequência de escape, ignoramos
                * seus caracteres.
                *
                * A intenção neste momento é impedir que sequências de controle
                * apareçam como texto digitado pelo usuário.
            */
            if( this.emSequenciaEscape ){
                /*
                    * Quando encontramos o final da sequência, voltamos
                    * ao estado normal.
                */
                if( /[A-Za-z~]/.test(tecla) ){
                    this.emSequenciaEscape = false
                }

                continue
            }

            /*
             * Enter finaliza a entrada somente quando existe conteúdo.
             */
            if( tecla === "\r" || tecla === "\n" ){
                /*
                 * Se o usuário pressionou Enter sem digitar conteúdo,
                 * simplesmente ignoramos a tecla.
                 *
                 * O trim() remove espaços das extremidades antes da
                 * validação. Assim, uma entrada contendo apenas espaços
                 * também é considerada vazia.
                 */
                if( this.mensagem.trim().length === 0 ){
                    this.mostrarPrompt()
                    continue
                }

                /*
                    * Criamos uma cópia do conteúdo atual antes de resolver
                    * a Promise.
                */
                const mensagem = this.mensagem

                /*
                    * Finaliza a Promise criada em receberMensagem().
                    *
                    * A partir daqui, esta instrução:
                    *
                    *      await input.receberMensagem()
                    *
                    * recebe a string armazenada em "mensagem".
                */
                this.resolver?.(mensagem)

                /*
                    * Não existe mais uma Promise esperando por uma resposta.
                */
                this.resolver = undefined

                continue
            }

               /*
             * Backspace remove o último caractere.
             */
            if (tecla === "\x7f" || tecla === "\b") {
                /*
                    * Transformamos a string em um array para remover
                    * o último caractere digitado.
                    *
                    * Exemplo:
                    *
                    * "atac"
                    *   ↓
                    * ["a", "t", "a", "c"]
                    *   ↓ slice(0, -1)
                    * ["a", "t", "a"]
                    *   ↓ join("")
                    * "ata"
                */
                this.mensagem = Array.from(this.mensagem)
                    .slice(0, -1)
                    .join("")
                
                /*
                    * Redesenha o prompt para refletir a remoção do caractere.
                */
                this.mostrarPrompt()
                continue
            }

            //* CTRL+C é tratado como encerramento da aplicação.
            if (tecla === "\x03") {

                //*Primeiro liberamos os recursos utilizados pelo Input.
                this.fechar()
                /*
                    * Envia SIGINT para o próprio processo.
                    *
                    * Isso permite que o processo seja encerrado de forma
                    * normal em vez de simplesmente abandonar o terminal
                    * em raw mode.
                */
                process.kill(process.pid, "SIGINT")
                return
            }

            /*
                * Caracteres de controle que não tratamos explicitamente
                * são ignorados.
                *
                * Isso impede que comandos internos do terminal sejam
                * adicionados ao texto da mensagem.
            */
            if (tecla < " ") {
                continue
            }


            /*
                * Caracteres normais são adicionados ao buffer.
                *
                * Exemplo:
                *
                * usuário digita "a"
                * → mensagem = "a"
                *
                * depois "t"
                * → mensagem = "at"
            */
            this.mensagem += tecla

            // * Redesenha o prompt com o novo conteúdo.
            this.mostrarPrompt()

        }
    }

    //* Desenha a área de entrada do jogador.
    private mostrarPrompt() {
        /*
         * 999B leva o cursor até o final da tela.
         * Depois voltamos para a primeira coluna e limpamos a linha.
         */
        output.write("\x1b[999B\r\x1b[K> " + this.mensagem)
    }

    //* Encerra o sistema de entrada e devolve o terminal ao comportamento normal
    fechar(){
        /*
            * Remove o listener registrado no stdin.
            *
            * Sem isso, o objeto continuaria reagindo às teclas mesmo depois
            * de a aplicação decidir encerrá-lo.
        */
        input.off("data", this.tratarTecla)

        //* Desativa o raw mode para devolver o terminal ao funcionamento tradicional
        if (input.isTTY) {
            input.setRawMode(false)
        }

        //*Para temporariamente o recebimento de dados.
        input.pause()

        //*Permite que o stdin não mantenha o processo vivo sozinho.
        input.unref()

        //* Atualiza o estado interno para indicar que o listener não está mais ativo
        this.escutando = false

        //*Não existe mais nenhuma Promise esperando uma mensagem.
        this.resolver = undefined
    }

    //* É usado enquanto o Orquestrador está processando a mensagem, evitando que o usuário continue enviando entradas simultaneamente.
    pausar(){
        input.pause()
    }

    //*Retoma a leitura do teclado depois que o processamento termina.
    retomar(){
        input.resume()
    }

}