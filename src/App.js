import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VarietiesPage from './pages/VarietiesPage';
import FieldTrialsPage from './pages/FieldTrialsPage';
import WeatherDataPage from './pages/WeatherDataPage';
import StorageConditionsPage from './pages/StorageConditionsPage';
import CultivationTechniquesPage from './pages/CultivationTechniquesPage';
import PlantProtectionsPage from './pages/PlantProtectionsPage';
import VarietyDetailPage from './pages/VarietyDetailPage';
import ReportsPage from './pages/ReportPage'; // Исправлен импорт ReportsPage
import './App.css'; // Добавляем CSS файл для стилизации

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul className="horizontal-menu">
            <li>
              <Link to="/">Home</Link> {/* Главная страница */}
            </li>
            <li>
              <Link to="/varieties">Potato Varieties</Link> {/* Сорта картофеля */}
            </li>
            <li>
              <Link to="/fieldtrials">Field Trials</Link> {/* Полевые испытания */}
            </li>
            <li>
              <Link to="/plantprotections">Plant Protection</Link> {/* Защита растений */}
            </li>
            <li>
              <Link to="/cultivationtechniques">Plant Care</Link> {/* Уход за растениями */}
            </li>
            <li>
              <Link to="/storageconditions">Storage Conditions</Link> {/* Условия хранения */}
            </li>
            <li>
              <Link to="/weatherdata">Climate Data</Link> {/* Климатические данные */}
            </li>
            <li>
              <Link to="/reports">Create Report</Link> {/* Создание отчета */}
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/varieties" element={<VarietiesPage />} />
          <Route path="/varieties/:id" element={<VarietyDetailPage />} />
          <Route path="/fieldtrials" element={<FieldTrialsPage />} />
          <Route path="/weatherdata" element={<WeatherDataPage />} />
          <Route path="/storageconditions" element={<StorageConditionsPage />} />
          <Route path="/cultivationtechniques" element={<CultivationTechniquesPage />} />
          <Route path="/plantprotections" element={<PlantProtectionsPage />} />
          <Route path="/reports" element={<ReportsPage />} /> {/* Добавлен маршрут для страницы отчетов */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
