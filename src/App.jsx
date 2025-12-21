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
import RegistrationForm from './pages/RegistrationForm'
import AdminRegistrations from './pages/AdminRegistrations.jsx'
import SelectInput from './pages/SelectInput.jsx'
import ImportCSV from './pages/ImportCSV.jsx'
import ExportPDF from './pages/ExportPDF.jsx'

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
        <Route path="/input-data" element={<SelectInput />} />
        <Route path="/input-data/form" element={<Form />} />
        <Route path="/input-data/registrasi" element={<RegistrationForm />} />
        <Route path="/daftar-pelanggan" element={<DaftarPelangganLayout />}>
          <Route index element={<List />} />
          <Route path='detail/:id' element={<Detail />} />
          <Route path='edit-pelanggan/:id' element={<EditForm />} />
        </Route>
        <Route path="/analitik" element={<Analytic />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/registrations" element={<AdminRegistrations />} />
        <Route path="/admin/import-csv" element={<ImportCSV />} />
        <Route path="/export-pdf" element={<ExportPDF />} />
        <Route path="/edit-profile" element={<Edit />} />

        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
