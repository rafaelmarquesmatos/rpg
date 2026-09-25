import net from "node:net"
import readline from "node:readline"

const socket = net.connect(9876, "127.0.0.1")
const linhas = readline.createInterface({ input: socket })

for await (const linha of linhas) {
    console.log(linha)
}