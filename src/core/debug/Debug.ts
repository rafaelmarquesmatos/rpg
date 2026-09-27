import { spawn } from "node:child_process"
import { platform } from "node:process"
import net from "node:net"
import { fileURLToPath } from "node:url"

function abrirJanela(script: string) {
    if (platform === "win32") {
        const filho = spawn("cmd.exe", ["/c", "start", "node", script], {
            detached: true,
            stdio: "ignore"
        })

        filho.unref()
    }

    if (platform === "linux") {
        const filho = spawn("ptyxis", ["--", "node", script], {
            detached: true,
            stdio: "ignore"
        })

        filho.unref()
    }
}

export default class Debug {
    private static socket: net.Socket | undefined
    private static servidor: net.Server | undefined     //* guarda a referencia ao servidor TCP criado
    private static fila: string[] = []

    //* cria a conexão com o servidor TCP
    public static iniciar() {
        const servidor = net.createServer((conexao) => {
            Debug.socket = conexao

            //* antes tinha a possibilidade de dar erro mas ninguem ouvia
            conexao.on("error", (erro) => {
                console.log("Erro na conexão do Debug:", erro.message)
            })

            for (const texto of this.fila) {
                conexao.write(texto + "\n")
            }

            //* a função nao precida depender de um contexto pra usar "this"
            Debug.fila = []
        })
        
        //*armazena esse endereco em uma variavel
        Debug.servidor = servidor
        
        Debug.servidor.listen(9876, "127.0.0.1", () => {
            const script = fileURLToPath(new URL("../../../src/core/debug/janela.mjs", import.meta.url))
            abrirJanela(script)
        }) 
    }
    //* fecha a conexão com o servidor TCP
    public static fechar(){
        Debug.socket?.destroy()
        Debug.servidor?.close()
    }
    
    public static print(texto: string, separar?: boolean) {     //!estava Boolean 
        const final = separar ? `${texto}\n\n\n` : texto

        if (!Debug.socket) {
            Debug.fila.push(texto)
            return
        }

        Debug.socket.write(final + "\n")
    }
}