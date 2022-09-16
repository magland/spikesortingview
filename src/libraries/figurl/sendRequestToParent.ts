import { FigurlRequest, FigurlResponse } from "./viewInterface/FigurlRequestTypes";
import { FigurlResponseMessage } from "./viewInterface/MessageToChildTypes";
import { FigurlRequestMessage } from "./viewInterface/MessageToParentTypes";
import sendMessageToParent from "./sendMessageToParent";
import { randomAlphaString } from "@figurl/spikesortingview.core-utils";

const urlSearchParams = new URLSearchParams(window.location.search)
const queryParams = Object.fromEntries(urlSearchParams.entries())

const pendingRequests: {[key: string]: {
    onResponse: (response: FigurlResponse) => void
    onError: (err: any) => void
}} = {}

export const handleFigurlResponse = (msg: FigurlResponseMessage) => {
    const requestId = msg.requestId
    const response = msg.response
    if (requestId in pendingRequests) {
        pendingRequests[requestId].onResponse(response)
        delete pendingRequests[requestId]
    }
}

export const figureId = queryParams.figureId || 'undefined'

const sendRequestToParent = async (request: FigurlRequest) => {
    return new Promise((resolve, reject) => {
        const requestId = randomAlphaString(10)
        pendingRequests[requestId] = {
            onResponse: (response: FigurlResponse) => {
                resolve(response)
            },
            onError: (err: any) => {
                reject(err)
            }
        }
        const msg: FigurlRequestMessage = {
            type: 'figurlRequest',
            figureId,
            requestId,
            request
        }
        sendMessageToParent(msg)
    })
}

export default sendRequestToParent