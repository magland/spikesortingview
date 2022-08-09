import { useCallback, useMemo, useRef } from "react"
import { DebounceThrottleResolver, DebounceThrottleUpdater, useThrottler } from "util/useDebouncer"
import { matchFocusToFrame } from "./TPATimeSyncLogic"

type debounceUpdateRefs = { currentTargetFocusTimeRef: React.MutableRefObject<number | undefined> }
type debounceUpdateProps = { currentTime: number | undefined }
type debounceUpdateResolverProps = { committer: (time: number | undefined, setTimeFocus: timeSetter) => void, setterFn: timeSetter }

type timeSetter = (time: number, o?: any) => void

const throttleRateMs = 100

const timeUpdater: DebounceThrottleUpdater<debounceUpdateProps, debounceUpdateRefs> = (refs, state) => {
    if (state.currentTime === refs.currentTargetFocusTimeRef.current) return false
    refs.currentTargetFocusTimeRef.current = state.currentTime
    return true
}
const timeResolver: DebounceThrottleResolver<debounceUpdateRefs, debounceUpdateResolverProps> = (refs, props) => {
    // It looks like this is actually getting called too often--not sure what's going on there.
    // console.log(`Updating time, it is ${Date.now()}`)
    props.committer(refs.currentTargetFocusTimeRef.current, props.setterFn)
}

const checkFocusIsWithinEpsilon = (scheduledFocusRef: React.MutableRefObject<number | undefined>, focusTime: number | undefined, replayRateMultiplier: number) => {
    if (scheduledFocusRef.current === undefined || focusTime === undefined) return false
    // At 1:1 playback, we expect ~100 ms to pass between 100-ms-throttled focus-update calls. Just need to multiply by replay rate multiplier.
    const epsilon = Math.abs(throttleRateMs * replayRateMultiplier * 1.5 * .001) // the 1.5 multiplier gives us a bit of fudge, while .001 converts MS to S.
    return Math.abs(scheduledFocusRef.current - focusTime) < epsilon
}

const useLiveFocusReset = (setTimeFocus: timeSetter) => {
    const currentTargetFocusTimeRef = useRef<number | undefined>(undefined)
    const refs: debounceUpdateRefs = useMemo(() => { return { currentTargetFocusTimeRef }}, [currentTargetFocusTimeRef])
    const resolverProps = useMemo(() => { return { committer: matchFocusToFrame, setterFn: setTimeFocus }  }, [setTimeFocus])
    const { throttler, cancelThrottled } = useThrottler(timeUpdater, timeResolver, refs, resolverProps, throttleRateMs)
    const checkFocusWithinEpsilon = useCallback(
        (focusTime: number | undefined, replayRateMultiplier: number) => checkFocusIsWithinEpsilon(refs.currentTargetFocusTimeRef, focusTime, replayRateMultiplier),
        [refs])

    return { liveFocus: throttler, checkFocusWithinEpsilon, cancelPendingRefocus: cancelThrottled }
}


export default useLiveFocusReset
