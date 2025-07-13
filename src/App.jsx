import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PhotoViewer from './pages/PhotoViewer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/view/:personId" element={<PhotoViewer />} />
      </Routes>
    </BrowserRouter>
  );
}
