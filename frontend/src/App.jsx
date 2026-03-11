import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import TopHeader from "./components/TopHeader.jsx";
import Home from "./pages/Home.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import AnalyzerPage from "./pages/Analyzer.jsx";

function App() {
  return (
    <div className="min-h-screen text-slate-50">
      <Sidebar />
      <div className="min-h-screen md:pl-[72px]">
        <TopHeader />
        <main className="px-5 py-6 lg:px-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyzer" element={<AnalyzerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
