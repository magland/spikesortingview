import React, { useCallback, useContext, useEffect } from "react"
import sendRequestToParent from "./sendRequestToParent"
import { isSetUrlStateResponse, SetUrlStateRequest } from "./viewInterface/FigurlRequestTypes"

export type UrlState = {[key: string]: any}

const urlSearchParams = new URLSearchParams(window.location.search)
const queryParams = Object.fromEntries(urlSearchParams.entries())
export const initialUrlState = JSON.parse(queryParams.s || '{}')

const UrlStateContext = React.createContext<{
    urlState?: UrlState,
    setUrlState?: (s: UrlState) => void
}>({})

const dummySetUrlState = (s: UrlState) => {}

export const useUrlState = () => {
    const c = useContext(UrlStateContext)
    const {urlState, setUrlState} = c

    const updateUrlState = useCallback((s: {[key: string]: any}) => {
        const newUrlState = {...(urlState || initialUrlState)}
        let somethingChanged = false
        for (let k in s) {
            const newVal = s[k]
            const oldVal = (urlState || (initialUrlState))[k]
            if (newVal !== oldVal) {
                newUrlState[k] = newVal
                somethingChanged = true
            }
        }
        if (somethingChanged) {
            setUrlState && setUrlState(newUrlState)
        }
    }, [urlState, setUrlState])

    useEffect(() => {
        ;(async () => {
            const request: SetUrlStateRequest = {
                type: 'setUrlState',
                state: urlState || {}
            }
            const response = await sendRequestToParent(request)
            if (!isSetUrlStateResponse(response)) throw Error('Invalid response to setUrlState')
        })()
    }, [urlState])

    return {
        urlState: urlState || initialUrlState,
        setUrlState: setUrlState || dummySetUrlState,
        updateUrlState,
        initialUrlState
    }
}

export default UrlStateContext