import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Calendar } from '@/pages/Calendar';
import { Release } from '@/pages/Release';
import { Requirements } from '@/pages/Requirements';
import { Testing } from '@/pages/Testing';
import { ChecklistPage } from '@/pages/Checklist';
import { Records } from '@/pages/Records';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/calendar" replace />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="release" element={<Release />} />
          <Route path="release/:id" element={<Release />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="testing/:id" element={<Testing />} />
          <Route path="checklist/:id" element={<ChecklistPage />} />
          <Route path="records" element={<Records />} />
        </Route>
      </Routes>
    </Router>
  );
}