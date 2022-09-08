import sendRequestToParent from "./sendRequestToParent"
import { GetMutableRequest, isGetMutableResponse } from "./viewInterface/FigurlRequestTypes"

const getMutable = async (key: string) => {
    const request: GetMutableRequest = {
        type: 'getMutable',
        key
    }
    const response = await sendRequestToParent(request)
    if (!isGetMutableResponse(response)) throw Error('Invalid response to getMutable')
    return response.value
}

export default getMutable