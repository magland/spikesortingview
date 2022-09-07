import { MuiThemeProvider } from '@material-ui/core';
import { RecordingSelectionContext, defaultRecordingSelection, recordingSelectionReducer } from 'libraries/RecordingSelectionContext';
import { getFigureData, useWindowDimensions } from 'figurl';
import SetupUrlState from 'figurl/SetupUrlState';
import { defaultUnitSelection, UnitSelectionContext, unitSelectionReducer } from 'libraries/UnitSelectionContext';
import { useEffect, useMemo, useReducer, useState } from 'react';
import './localStyles.css';
import theme from './theme';
import View from './View';
import { isViewData, ViewData } from './ViewData';

function App() {
  const [data, setData] = useState<ViewData>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const {width, height} = useWindowDimensions()

  const [unitSelection, unitSelectionDispatch] = useReducer(unitSelectionReducer, defaultUnitSelection)
  const [recordingSelection, recordingSelectionDispatch] = useReducer(recordingSelectionReducer, defaultRecordingSelection)

  useEffect(() => {
    getFigureData().then((data: any) => {
      if (!isViewData(data)) {
        setErrorMessage(`Invalid figure data`)
        console.error('Invalid figure data', data)
        return
      }
      setData(data)
    }).catch((err: any) => {
      setErrorMessage(`Error getting figure data`)
      console.error(`Error getting figure data`, err)
    })
  }, [])

  const opts = useMemo(() => ({}), [])

  if (errorMessage) {
    return <div style={{color: 'red'}}>{errorMessage}</div>
  }

  if (!data) {
    return <div>Waiting for data</div>
  }

  return (
    <MuiThemeProvider theme={theme}>
      <RecordingSelectionContext.Provider value={{recordingSelection, recordingSelectionDispatch}}>
        <UnitSelectionContext.Provider value={{unitSelection, unitSelectionDispatch}}>
          <SetupUrlState>
            <View
              data={data}
              opts={opts}
              width={width - 10}
              height={height - 5}
            />
          </SetupUrlState>
        </UnitSelectionContext.Provider>
      </RecordingSelectionContext.Provider>
    </MuiThemeProvider>
  )
}

export default App;

