import { ThemeProvider } from 'next-themes'
import { NetOpsMap } from './components/map/NetOpsMap'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <NetOpsMap />
    </ThemeProvider>
  )
}

export default App
