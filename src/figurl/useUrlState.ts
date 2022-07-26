import { useCallback, useEffect, useState } from "react"
import sendRequestToParent from "./sendRequestToParent"
import { isSetUrlStateResponse, SetUrlStateRequest } from "./viewInterface/FigurlRequestTypes"

const urlSearchParams = new URLSearchParams(window.location.search)
const queryParams = Object.fromEntries(urlSearchParams.entries())

const initialUrlState = JSON.parse(queryParams.s || '{}')

const useUrlState = () => {
    const [urlState, setUrlState] = useState(initialUrlState)

    const updateUrlState = useCallback((s: {[key: string]: any}) => {
        const newUrlState = {...urlState}
        let somethingChanged = false
        for (let k in s) {
            const newVal = s[k]
            const oldVal = urlState[k]
            if (newVal !== oldVal) {
                newUrlState[k] = newVal
                somethingChanged = true
            }
        }
        if (somethingChanged) {
            setUrlState(newUrlState)
        }
    }, [urlState])

    useEffect(() => {
        ;(async () => {
            const request: SetUrlStateRequest = {
                type: 'setUrlState',
                state: urlState
            }
            const response = await sendRequestToParent(request)
            if (!isSetUrlStateResponse(response)) throw Error('Invalid response to setUrlState')
        })()
    }, [urlState])


    return {urlState, setUrlState, updateUrlState, initialUrlState}
}

export default useUrlState