import { useEffect, useState } from "react";
import feedManager, { Feed } from "./feedManager";
import { sleepMsec } from "./util/sleepMsec";
import { messageCount, unscaledDurationMsec } from "./viewInterface/kacheryTypes";
import { JSONObject } from "./viewInterface/validateObject";

export const parseFeedUri = (feedUri: string) => {
    const a = feedUri.split('/')
    const feedId = a[2]
    return {feedId}
}

const useFeed = (args: {feedId?: string, feedUri?: string}): {messages: JSONObject[] | undefined, feed: Feed | undefined} => {
    let {feedId, feedUri} = args
    if (feedUri) {
        if (feedId) {
            throw Error('useFeed: Cannot specify both feedUri and feedId')
        }
        const {feedId: fid} = parseFeedUri(feedUri)
        feedId = fid
    }
    const [messages, setMessages] = useState<JSONObject[] | undefined>(undefined)
    const [feed, setFeed] = useState<Feed | undefined>(undefined)

    useEffect(() => {
        setMessages(undefined)
        setFeed(undefined)
        if (!feedId) return
        let valid = true
        ;(async () => {
            const feed = feedManager.loadFeed(feedId)
            setFeed(feed)
            let internalPosition = 0
            while (valid) {
                const messages = await feed.waitForMessages({position: internalPosition, maxNumMessages: messageCount(0), waitMsec: unscaledDurationMsec(10000)})
                if (!valid) return
                if (messages.length > 0) {
                    const localMessages = feed.getLocalMessages()
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
    }, [feedId])

    return {messages, feed}
}

export default useFeed