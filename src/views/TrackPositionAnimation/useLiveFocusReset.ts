import { useRef } from "react"
import { DebounceThrottleResolver, DebounceThrottleUpdater, useThrottler } from "util/useDebouncer"
import { matchFocusToFrame } from "./TPATimeSyncLogic"

// NOTE: This is a sketch that isn't fully implemented yet.

type debounceUpdateRefs = { currentTimeRef: React.MutableRefObject<number | undefined> }
type debounceUpdateProps = { currentTime: number | undefined }
type debounceUpdateResolverProps = { committer: (time: number | undefined, setTimeFocus: any) => void, setterFn: any }


const currentTimeRef = useRef<number | undefined>(undefined)
const refs: debounceUpdateRefs = { currentTimeRef }
const timeUpdater: DebounceThrottleUpdater<debounceUpdateProps, debounceUpdateRefs> = (refs, state) => {
    if (state.currentTime === refs.currentTimeRef.current) return false
    refs.currentTimeRef.current = state.currentTime
    return true
}
const timeResolver: DebounceThrottleResolver<debounceUpdateRefs, debounceUpdateResolverProps> = (refs, props) => {
    console.log(`Updating time, it is ${Date.now()}`)
    props.committer(refs.currentTimeRef.current, props.setterFn)
}

const useLiveFocusReset = (setTimeFocus: any) => {
    const liveFocus = useThrottler(timeUpdater, timeResolver, refs, { committer: matchFocusToFrame, setterFn: setTimeFocus }, 100)

    return liveFocus
}


export default useLiveFocusReset
