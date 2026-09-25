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
    private static fila: string[] = []

    public static iniciar() {
        const servidor = net.createServer((conexao) => {
            Debug.socket = conexao
            for (const texto of this.fila) {
                conexao.write(texto + "\n")
            }
            this.fila = []
        })

        servidor.listen(9876, "127.0.0.1", () => {
            const script = fileURLToPath(new URL("../../../src/core/debug/janela.mjs", import.meta.url))
            abrirJanela(script)
        }) 
    }

    public static print(texto: string, separar?: Boolean) {
        const final = separar ? `${texto}\n\n\n` : texto

        if (!Debug.socket) {
            Debug.fila.push(texto)
            return
        }

        Debug.socket.write(final + "\n")
    }
}