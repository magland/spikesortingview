import { validateObject } from "@figurl/spikesortingview.core-utils"
import { isArrayOf, isEqualTo } from "@figurl/spikesortingview.core-utils"


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