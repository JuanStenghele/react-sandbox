import { Routes, Route } from 'react-router';
import Home from './pages/home/Home';

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  );
}
