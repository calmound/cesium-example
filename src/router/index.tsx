import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ListPage } from '@/pages/examples/list'
import { DetailPage } from '@/pages/examples/detail'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/examples" replace /> },
  { path: '/examples', element: <ListPage /> },
  { path: '/examples/:id', element: <DetailPage /> },
])
