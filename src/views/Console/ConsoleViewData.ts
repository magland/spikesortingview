import { validateObject } from "figurl"
import { isArrayOf, isEqualTo } from "figurl/viewInterface/validateObject"


export type ConsoleViewData = {
    type: 'Console'
    consoleLines: {text: string, timestamp: number, stderr: boolean}[]
}

export const isConsoleViewData = (x: any): x is ConsoleViewData => {
    return validateObject(x, {
        type: isEqualTo('Console'),
        consoleLines: isArrayOf(() => (true))
    }, {allowAdditionalFields: true})
}