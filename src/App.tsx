import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { Workbench } from '@/pages/Workbench';
import { Dashboard } from '@/pages/Dashboard';
import { Calendar } from '@/pages/Calendar';
import { Release } from '@/pages/Release';
import { Requirements } from '@/pages/Requirements';
import { Testing } from '@/pages/Testing';
import { TestingSelect } from '@/pages/Testing/SelectVersion';
import { ChecklistPage } from '@/pages/Checklist';
import { ChecklistSelect } from '@/pages/Checklist/SelectVersion';
import { Records } from '@/pages/Records';
import { VersionList } from '@/pages/VersionList';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/workbench" replace />} />
          <Route path="workbench" element={<Workbench />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="versions" element={<VersionList />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="release" element={<Release />} />
          <Route path="release/:id" element={<Release />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="testing" element={<TestingSelect />} />
          <Route path="testing/:id" element={<Testing />} />
          <Route path="checklist" element={<ChecklistSelect />} />
          <Route path="checklist/:id" element={<ChecklistPage />} />
          <Route path="records" element={<Records />} />
        </Route>
      </Routes>
    </Router>
  );
}