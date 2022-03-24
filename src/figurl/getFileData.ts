import sendRequestToParent from "./sendRequestToParent"
import { GetFileDataRequest, isGetFileDataResponse } from "./viewInterface/FigurlRequestTypes"
import { Sha1Hash } from "./viewInterface/kacheryTypes"

const getFileData = async (sha1OrUri: string) => {
    const isUri = sha1OrUri.startsWith('ipfs://') || sha1OrUri.startsWith('sha1://')
    const request: GetFileDataRequest = {
        type: 'getFileData',
        sha1: isUri ? undefined : sha1OrUri as any as Sha1Hash,
        uri : isUri ? sha1OrUri : undefined
    }
    const response = await sendRequestToParent(request)
    if (!isGetFileDataResponse(response)) throw Error('Invalid response to getFigureData')
    return response.fileData
}

export default getFileData