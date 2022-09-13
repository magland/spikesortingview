import sendMessageToParent from "./sendMessageToParent"
import { figureId } from "./sendRequestToParent"

export const sendMessageToBackend = (message: any) => {
    sendMessageToParent({
        type: 'messageToBackend',
        figureId,
        message
    })
}

const onMessageFromBackendCallbacks: ((message: any) => void)[] = []
export const onMessageFromBackend = (callback: (message: any) => void) => {
    onMessageFromBackendCallbacks.push(callback)
}
export const handleMessageFromBackend = (message: any) => {
    for (let cb of onMessageFromBackendCallbacks) {
        cb(message)
    }
}