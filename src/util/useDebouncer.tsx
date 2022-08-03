import { useCallback, useRef } from 'react'


export type DebounceUpdater<T, TRefs> = (refs: TRefs, state: T) => boolean
export type DebounceResolver<TRefs, ResolverProps> = (refs: TRefs, props: ResolverProps) => void

// TODO: Okay, technically this is a THROTTLE, not a DEBOUNCE: debounce fires after X time with no event, while
// a throttle rate-limits the event in progress. We should consider providing both...
// And also renaming this for accuracy/pedantry.
export const useDebouncer = <T, TRefs, ResolverProps>(updateFn: DebounceUpdater<T, TRefs>, resolveFn: DebounceResolver<TRefs, ResolverProps>, refs: TRefs, resolverProps: ResolverProps) => {
    const pendingRequest = useRef<number| undefined>(undefined)
    const cleanup = useCallback(() => pendingRequest.current = undefined, [pendingRequest])

    const updater = useCallback((state: T) => updateFn(refs, state), [updateFn, refs])
    const resolver = useCallback((time: number) => {
        // OPTIONAL: documentation here controlled by debug or something?
        resolveFn(refs, resolverProps)
        cleanup()
    }, [resolveFn, refs, resolverProps, cleanup])
    const debouncer = useCallback((state: T) => {
        const change = updater(state)
        console.log(`Request pending: ${pendingRequest.current} Change: ${change}`)
        if (change && !(pendingRequest.current)) {
            console.log(`Scheduling update`)
            pendingRequest.current = window.requestAnimationFrame(resolver)
        }
    }, [pendingRequest, updater, resolver])
    return debouncer
}
