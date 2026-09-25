import { iniciar } from "./cli/cli.js"
import Debug from "./core/debug/Debug.js"

const log = true
Debug.iniciar()

if (log) {
    Debug.print('debug está ativo', true)
}

iniciar()