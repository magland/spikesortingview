import { validateObject } from "libraries/util-validate-object"
import { isArrayOf, isEqualTo } from "libraries/util-validate-object"


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