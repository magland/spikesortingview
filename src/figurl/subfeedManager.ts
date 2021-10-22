import { DurationMsec, FeedId, MessageCount, SubfeedHash, SubfeedMessage, subfeedPosition, SubfeedPosition } from "./viewInterface/kacheryTypes"
import randomAlphaString from "./util/randomAlphaString"
import { isSubscribeToSubfeedResponse, SubscribeToSubfeedRequest } from "./viewInterface/FigurlRequestTypes"
import { NewSubfeedMessagesMessage } from "./viewInterface/MessageToChildTypes"
import sendRequestToParent from "./sendRequestToParent"

export class Subfeed {
    #localMessages: SubfeedMessage[] = []
    #internalListeners: {[key: string]: () => void} = {}
    constructor(public feedId: FeedId, public subfeedHash: SubfeedHash) {
        const req: SubscribeToSubfeedRequest = {
            type: 'subscribeToSubfeed',
            feedId,
            subfeedHash
        }
        sendRequestToParent(req).then(resp => {
            if (!isSubscribeToSubfeedResponse(resp)) {
                throw Error('Invalid response to subscribeToSubfeed')
            }
            this._handleNewMessages(subfeedPosition(0), resp.messages)
        })
    }
    async waitForMessages(a: {position: SubfeedPosition, maxNumMessages: MessageCount, waitMsec: DurationMsec}): Promise<SubfeedMessage[]> {
        const {position, waitMsec} = a
        if (this.#localMessages.length > Number(position)) {
            return this.#localMessages.slice(Number(position))
        }
        return new Promise((resolve, reject) => {
            let ret: SubfeedMessage[] = []
            let finalized = false
            const listenerId = randomAlphaString(10)
            const finalize = () => {
                if (finalized) return
                finalized = true
                delete this.#internalListeners[listenerId]
                resolve(ret)
            }
            this.#internalListeners[listenerId] = () => {
                ret = this.#localMessages.slice(Number(position))
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
    _handleNewMessages(position: SubfeedPosition, messages: SubfeedMessage[]) {
        const messages2 = messages.slice(Number(position) - this.#localMessages.length)
        if (messages2.length === 0) return
        for (let msg of messages2) {
            this.#localMessages.push(msg)
        }
        for (let listenerId in this.#internalListeners) {
            this.#internalListeners[listenerId]()
        }
    }
}

class SubfeedManager {
    #subfeeds: {[key: string]: Subfeed} = {}
    loadSubfeed(feedId: FeedId, subfeedHash: SubfeedHash) {
        const code = getSubfeedCode(feedId, subfeedHash)
        if (code in this.#subfeeds) return this.#subfeeds[code]
        const sf = new Subfeed(feedId, subfeedHash)
        this.#subfeeds[code] = sf
        return sf
    }
    _handleNewSubfeedMessages(feedId: FeedId, subfeedHash: SubfeedHash, position: SubfeedPosition, messages: SubfeedMessage[]) {
        const code = getSubfeedCode(feedId, subfeedHash)
        if (code in this.#subfeeds) {
            this.#subfeeds[code]._handleNewMessages(position, messages)
        }
    }
}

const getSubfeedCode = (feedId: FeedId, subfeedHash: SubfeedHash) => {
    return `${feedId}:${subfeedHash}`
}

const subfeedManager = new SubfeedManager()

export const handleNewSubfeedMessages = (msg: NewSubfeedMessagesMessage) => {
    subfeedManager._handleNewSubfeedMessages(msg.feedId, msg.subfeedHash, msg.position, msg.messages)
}

export default subfeedManager