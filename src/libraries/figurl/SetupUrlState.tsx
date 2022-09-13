import { FunctionComponent, PropsWithChildren, useMemo, useState } from 'react';
import UrlStateContext, { initialUrlState, UrlState } from './UrlStateContext';

type Props = {
}

const SetupUrlState: FunctionComponent<PropsWithChildren<Props>> = (props) => {
    const [urlState, setUrlState] = useState<UrlState>(initialUrlState)
    const value = useMemo(() => ({urlState, setUrlState}), [urlState, setUrlState])
    return (
        <UrlStateContext.Provider value={value}>
            {props.children}
        </UrlStateContext.Provider>
    )
}

export default SetupUrlState