import { iniciar } from "./cli/cli.js"
import Debug from "./core/debug/Debug.js"

const log = true

if (log) {
    Debug.print('debug está ativo', true)
}

iniciar()