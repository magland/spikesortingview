import { MuiThemeProvider } from '@material-ui/core';
import RecordingSelectionContext, { defaultRecordingSelection, recordingSelectionReducer } from 'contexts/RecordingSelectionContext';
import UnitSelectionContext, { defaultUnitSelection, unitSelectionReducer } from 'contexts/UnitSelection/UnitSelectionContext';
import { getFigureData, useWindowDimensions } from 'figurl';
import SetupUrlState from 'figurl/SetupUrlState';
import { useEffect, useReducer, useState } from 'react';
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

