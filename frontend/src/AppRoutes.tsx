import { Route, Routes, Navigate } from 'react-router-dom'
import DefaultLayout from './layouts/DefaultLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import MarketplacePage from './pages/marketplace/MarketplacePage'
import CreateItemPage from './pages/marketplace/CreateItemPage'
import EditItemPage from './pages/marketplace/EditItemPage'
import UserItemsPage from './pages/marketplace/UserItemsPage'
import ItemDetails from './pages/ItemDetails'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import ProtectedRoute from './auth/ProtectedRoute'
import GuestRoute from './auth/GuestRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />
      <Route path="/marketplace" element={<DefaultLayout><Marketplace /></DefaultLayout>} />
      <Route path="/marketplace/list" element={<DefaultLayout><MarketplacePage /></DefaultLayout>} />
      <Route path="/marketplace/create" element={<ProtectedRoute><DefaultLayout><CreateItemPage /></DefaultLayout></ProtectedRoute>} />
      <Route path="/marketplace/:id" element={<DefaultLayout><ItemDetails /></DefaultLayout>} />
      <Route path="/marketplace/:id/edit" element={<ProtectedRoute><DefaultLayout><EditItemPage /></DefaultLayout></ProtectedRoute>} />
      <Route path="/dashboard/items" element={<ProtectedRoute><DashboardLayout><UserItemsPage /></DashboardLayout></ProtectedRoute>} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <DefaultLayout><Login /></DefaultLayout>
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <DefaultLayout><Register /></DefaultLayout>
          </GuestRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DefaultLayout><Profile /></DefaultLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<DefaultLayout><NotFound /></DefaultLayout>} />
    </Routes>
  )
}

export default AppRoutes
