import { type FC } from 'react'
import Game from './components/Game'
import styled from 'styled-components'

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
`

const App: FC = () => {
  return (
    <AppContainer>
      <Game />
    </AppContainer>
  )
}

export default App
