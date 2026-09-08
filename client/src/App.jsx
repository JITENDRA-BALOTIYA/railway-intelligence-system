import { BrowserRouter } from 'react-router-dom'
import { TrainProvider } from './context/TrainContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

function App() {
  return (
    <BrowserRouter>
      <TrainProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </TrainProvider>
    </BrowserRouter>
  )
}

export default App
