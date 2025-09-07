import React from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'

// Public
import Login from './pages/Login'

// Protection
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Login Needed
import Dashboard from './pages/Dashboard'
import Map from './pages/Map'
import Form from './pages/Form'
import List from './pages/List'
import Detail from './pages/Detail'
import Analytic from './pages/Analytic'
import Edit from './pages/Edit'
import EditForm from './pages/EditForm'
import AdminPanel from './pages/AdminPanel'

const DaftarPelangganLayout = () => {
  return <Outlet />;
}

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/peta" element={<Map />} />
        <Route path="/input-data" element={<Form />} />
        <Route path="/daftar-pelanggan" element={<DaftarPelangganLayout />}>
          <Route index element={<List />} />
          <Route path='detail/:id' element={<Detail />} />
          <Route path='edit-pelanggan/:id' element={<EditForm />} />
        </Route>
        <Route path="/analitik" element={<Analytic />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/edit-profile" element={<Edit />} />

        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
