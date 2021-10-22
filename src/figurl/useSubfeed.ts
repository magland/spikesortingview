import { FeedId, messageCount, sha1OfString, SubfeedHash, SubfeedMessage, subfeedPosition, unscaledDurationMsec } from "./viewInterface/kacheryTypes";
import { useEffect, useState } from "react";
import subfeedManager, { Subfeed } from "./subfeedManager";
import { sleepMsec } from "./util/sleepMsec";

export const parseSubfeedUri = (subfeedUri: string) => {
    const a = subfeedUri.split('/')
    const feedId = a[2] as any as FeedId
    let subfeedHash: SubfeedHash
    if (a[3].startsWith('~')) {
        subfeedHash = a[3].slice(1) as any as SubfeedHash
    }
    else {
        subfeedHash = sha1OfString(a[3]) as any as SubfeedHash
    }
    return {feedId, subfeedHash}
}

const useSubfeed = (args: {feedId?: FeedId, subfeedHash?: SubfeedHash, subfeedUri?: string}): {messages: SubfeedMessage[] | undefined, subfeed: Subfeed | undefined} => {
    let {feedId, subfeedHash, subfeedUri} = args
    if (subfeedUri) {
        if ((feedId) || (subfeedHash)) {
            throw Error('useSubfeed: Cannot specify both subfeedUri and feedId/subfeedHash')
        }
        const {feedId: fid, subfeedHash: sfh} = parseSubfeedUri(subfeedUri)
        feedId = fid
        subfeedHash = sfh
    }
    const [messages, setMessages] = useState<SubfeedMessage[] | undefined>(undefined)
    const [subfeed, setSubfeed] = useState<Subfeed | undefined>(undefined)

    useEffect(() => {
        setMessages(undefined)
        setSubfeed(undefined)
        if (!feedId) return
        if (!subfeedHash) return
        let valid = true
        ;(async () => {
            const subfeed = subfeedManager.loadSubfeed(feedId, subfeedHash)
            setSubfeed(subfeed)
            let internalPosition = 0
            while (valid) {
                const messages = await subfeed.waitForMessages({position: subfeedPosition(internalPosition), maxNumMessages: messageCount(0), waitMsec: unscaledDurationMsec(10000)})
                if (!valid) return
                if (messages.length > 0) {
                    const localMessages = subfeed.getLocalMessages()
                    setMessages(localMessages)
                    internalPosition = localMessages.length
                }
                else {
                    await sleepMsec(unscaledDurationMsec(100))
                }
            }
        })()
        return () => {
            valid = false
        }
    }, [feedId, subfeedHash])

    return {messages, subfeed}
}

export default useSubfeed