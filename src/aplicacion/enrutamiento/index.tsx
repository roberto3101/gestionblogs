import { Navigate, Routes, Route } from 'react-router-dom';
import { rutasPublicas } from './rutasPublicas';
import { rutasPrivadas } from './rutasPrivadas';

export const Enrutamiento = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/panel" replace />} />
    {rutasPublicas}
    {rutasPrivadas}
    <Route path="*" element={<Navigate to="/panel" replace />} />
  </Routes>
);
