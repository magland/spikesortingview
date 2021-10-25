import sendRequestToParent from "./sendRequestToParent"
import { GetFileDataRequest, isGetFileDataResponse } from "./viewInterface/FigurlRequestTypes"
import { Sha1Hash } from "./viewInterface/kacheryTypes"

const getFileData = async (sha1: Sha1Hash) => {
    const request: GetFileDataRequest = {
        type: 'getFileData',
        sha1
    }
    const response = await sendRequestToParent(request)
    if (!isGetFileDataResponse(response)) throw Error('Invalid response to getFigureData')
    return response.fileData
}

export default getFileData