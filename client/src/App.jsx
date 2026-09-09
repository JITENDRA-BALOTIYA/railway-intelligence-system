import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { TrainProvider } from './context/TrainContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TrainProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </TrainProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
