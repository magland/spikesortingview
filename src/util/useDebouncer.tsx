import { useCallback, useMemo, useRef } from 'react'


export type DebounceThrottleUpdater<T, TRefs> = (refs: TRefs, state: T) => boolean
export type DebounceThrottleResolver<TRefs, ResolverProps> = (refs: TRefs, props: ResolverProps) => void

// TODO: Allow different throttling rate as per the debouncer?
export const useThrottler = <T, TRefs, ResolverProps>(
        updateFn: DebounceThrottleUpdater<T, TRefs>,
        resolveFn: DebounceThrottleResolver<TRefs, ResolverProps>,
        refs: TRefs,
        resolverProps: ResolverProps,
        timeMs?: number
    ) => {
    const pendingRequest = useRef<number| undefined>(undefined)
    const cleanup = useCallback(() => pendingRequest.current = undefined, [pendingRequest])

    const updater = useCallback((state: T) => updateFn(refs, state), [updateFn, refs])
    const resolver = useCallback((time: number) => {
        // OPTIONAL: could insert debug messages here
        resolveFn(refs, resolverProps)
        cleanup()
    }, [resolveFn, refs, resolverProps, cleanup])
    const throttler = useCallback((state: T) => {
        const change = updater(state)
        if (change && !(pendingRequest.current)) {
            pendingRequest.current = timeMs ?  window.requestAnimationFrame(resolver) : window.setTimeout(resolver, timeMs)
        }
    }, [pendingRequest, updater, resolver, timeMs])
    return throttler
}

export const useDebouncer = <T, TRefs, ResolverProps>(
        updateFn: DebounceThrottleUpdater<T, TRefs>,
        resolveFn: DebounceThrottleResolver<TRefs, ResolverProps>,
        refs: TRefs,
        resolverProps: ResolverProps,
        timeMs?: number
    ) => {
    const time = useMemo(() => timeMs ?? 100, [timeMs])
    const lastRequest = useRef<number | undefined>(undefined)
    const cleanup = useCallback(() => lastRequest.current = undefined, [lastRequest])

    const updater = useCallback((state: T) => updateFn(refs, state), [updateFn, refs])
    const resolver = useCallback((time: number) => {
        resolveFn(refs, resolverProps)
        cleanup()
    }, [resolveFn, refs, resolverProps, cleanup])
    const debouncer = useCallback((state: T) => {
        const change = updater(state)
        if (change) {
            if (lastRequest.current) clearTimeout(lastRequest.current)
            lastRequest.current = setTimeout(resolver, time)
        }
    }, [updater, lastRequest, resolver, time])
    return debouncer
}
