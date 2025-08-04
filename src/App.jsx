import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Map from './pages/Map'
import Form from './pages/Form'
import List from './pages/List'
import Analytic from './pages/Analytic'
import Edit from './pages/Edit'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/peta" element={<Map />} />
      <Route path="/input-data" element={<Form />} />
      <Route path="/daftar-pelanggan" element={<List />} />
      <Route path="/analitik" element={<Analytic />} />
      <Route path="/edit-profile" element={<Edit />} />
    </Routes>
  )
}

export default App
