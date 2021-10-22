import { handleTaskStatusUpdate } from "./initiateTask"
import { handleNewSubfeedMessages } from "./subfeedManager"
import { isMessageToChild } from "./viewInterface/MessageToChildTypes"
import { handleFigurlResponse } from "./sendRequestToParent"
import { handleSetCurrentUser } from "./useSignedIn"

const startListeningToParent = () => {
    window.addEventListener('message', e => {
        const msg = e.data
        if (isMessageToChild(msg)) {
            if (msg.type === 'figurlResponse') {
                handleFigurlResponse(msg)
            }
            else if (msg.type === 'taskStatusUpdate') {
                handleTaskStatusUpdate(msg)
            }
            else if (msg.type === 'newSubfeedMessages') {
                handleNewSubfeedMessages(msg)
            }
            else if (msg.type === 'setCurrentUser') {
                handleSetCurrentUser({userId: msg.userId, googleIdToken: msg.googleIdToken})
            }
        }
        else {
            console.log('Unhandled message', e)
        }
    })
}

export default startListeningToParent