import AppProvidersWrapper from "./components/wrappers/AppProvidersWrapper"
import AppRouter from "./routes/router"

import '@/assets/scss/app.scss'

// Fake backend disabled - using real backend API
// configureFakeBackend()

function App() {
  return (
    <AppProvidersWrapper>
      <AppRouter />
    </AppProvidersWrapper>
  )
}

export default App
