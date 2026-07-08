import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ApiTester from './ApiTester.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiTester />
  </StrictMode>,
)
