import sendRequestToParent from "./sendRequestToParent"
import randomAlphaString from "./util/randomAlphaString"
import { isSubscribeToFeedResponse, SubscribeToFeedRequest } from "./viewInterface/FigurlRequestTypes"
import { DurationMsec, MessageCount } from "./viewInterface/kacheryTypes"
import { NewFeedMessagesMessage } from "./viewInterface/MessageToChildTypes"
import { JSONObject } from "./viewInterface/validateObject"

export class Feed {
    #localMessages: JSONObject[] = []
    #internalListeners: {[key: string]: () => void} = {}
    constructor(public feedId: string) {
        const req: SubscribeToFeedRequest = {
            type: 'subscribeToFeed',
            feedId
        }
        sendRequestToParent(req).then(resp => {
            if (!isSubscribeToFeedResponse(resp)) {
                throw Error('Invalid response to subscribeToFeed')
            }
            this._handleNewMessages(0, resp.messages)
        })
    }
    async waitForMessages(a: {position: number, maxNumMessages: MessageCount, waitMsec: DurationMsec}): Promise<JSONObject[]> {
        const {position, waitMsec} = a
        if (this.#localMessages.length > position) {
            return this.#localMessages.slice(position)
        }
        return new Promise((resolve, reject) => {
            let ret: JSONObject[] = []
            let finalized = false
            const listenerId = randomAlphaString(10)
            const finalize = () => {
                if (finalized) return
                finalized = true
                delete this.#internalListeners[listenerId]
                resolve(ret)
            }
            this.#internalListeners[listenerId] = () => {
                ret = this.#localMessages.slice(position)
                finalize()
            }
            setTimeout(() => {
                if (!finalized) finalize()
            }, Number(waitMsec))
        })
    }
    getLocalMessages() {
        return [...this.#localMessages] // important to return a copy here
    }
    _handleNewMessages(position: number, messages: JSONObject[]) {
        const messages2 = messages.slice(position - this.#localMessages.length)
        if (messages2.length === 0) return
        for (let msg of messages2) {
            this.#localMessages.push(msg)
        }
        for (let listenerId in this.#internalListeners) {
            this.#internalListeners[listenerId]()
        }
    }
}

class FeedManager {
    #feeds: {[key: string]: Feed} = {}
    loadFeed(feedId: string) {
        if (feedId in this.#feeds) return this.#feeds[feedId]
        const sf = new Feed(feedId)
        this.#feeds[feedId] = sf
        return sf
    }
    _handleNewFeedMessages(feedId: string, position: number, messages: JSONObject[]) {
        if (feedId in this.#feeds) {
            this.#feeds[feedId]._handleNewMessages(position, messages)
        }
    }
}

const feedManager = new FeedManager()

export const handleNewFeedMessages = (msg: NewFeedMessagesMessage) => {
    feedManager._handleNewFeedMessages(msg.feedId, msg.position, msg.messages)
}

export default feedManager