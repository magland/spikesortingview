import { MessageToParent } from "./viewInterface/MessageToParentTypes";

const urlSearchParams = new URLSearchParams(window.location.search)
const queryParams = Object.fromEntries(urlSearchParams.entries())

const sendMessageToParent = (x: MessageToParent) => {
    if (!queryParams.parentOrigin) {
        console.warn('No parent origin. Posting message to self.')
        window.postMessage(x, '*')
        return
    }
    ;(window.top as any).postMessage(x, queryParams.parentOrigin)
}

export default sendMessageToParent