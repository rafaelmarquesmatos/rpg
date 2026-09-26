import net from "node:net"
import readline from "node:readline"

const socket = net.connect(9876, "127.0.0.1")
const linhas = readline.createInterface({ input: socket })

//* o cliente tmb precisa saber lidar com o erro. Agora quando o debug fecha o programa nao fecha junto
socket.on("error", (erro) => {
    console.error("Erro no socket do Debug:", erro.message)
})

for await (const linha of linhas) {
    console.log(linha)
}