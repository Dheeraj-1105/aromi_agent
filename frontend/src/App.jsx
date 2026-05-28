import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import OnboardingForm from './pages/OnboardingForm'
import WorkoutPlan from './pages/WorkoutPlan'
import NutritionPlan from './pages/NutritionPlan'
import ProgressTracker from './pages/ProgressTracker'
import Settings from './pages/Settings'
import Landing from './pages/Landing'
import ProtectedLayout from './components/Layout'
import useAuth from './store/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          
          {/* PUBLIC STANDALONE — no sidebar, no layout */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/chat" replace /> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<OnboardingForm />} />
          
          {/* PROTECTED — inside main layout with sidebar */}
          <Route element={<ProtectedLayout />}>
            <Route path="chat" element={<Home />} />
            <Route path="workout" element={<WorkoutPlan />} />
            <Route path="nutrition" element={<NutritionPlan />} />
            <Route path="progress" element={<ProgressTracker />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* CATCH ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

