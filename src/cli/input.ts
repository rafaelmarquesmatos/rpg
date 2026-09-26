import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

/**
 * @class Input contera as configurações de terminal considerando principios de esncapsulamento
 */

export class Input{
    //* gera a interface de entrada e saida no terminal
    private rl = createInterface({
        input,
        output
    })
    //* espera e promete entregar ums string em algum momento
    async receberMensagem(): Promise<string>{        
        return await this.rl.question("")
    }
    //! importante para liberar o recurso num esqueminha como "abrir -> usar -> liberar"
    fechar(){
        //* fecha o readline
        this.rl.close()
        //* deixa de receber dados da exucução do stdin
        input.pause()
        //* permite que o processo termine mesmo que stdin ainda exista como handle ativo
        input.unref()
    }
}