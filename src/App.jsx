import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import ScrollToTop from "./API,LoginAndOtherFiles/ScrollToTop";
import { AuthProvider } from "./API,LoginAndOtherFiles/AuthContext"; // Make sure path is correct

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import CalorieCalculator from "./pages/CalorieCalculator";
import Blog from "./pages/Blog";
import Dashboard from "./pages/Dashboard";
import MealPlanning from "./pages/MealPlanning";
import Profile from "./pages/Profile";
import Yoga from "./pages/Yoga";
import YogaDownload from "./pages/YogaDownload";
import PoseDetail from "./pages/PoseDetail";
import ExerciseList from "./components/ExerciseList";
import OurStory from "./pages/OurStory";
import Gym from "./pages/Gym";
import AIMeal from "./pages/PrePlannedMeals";
import RecipePage from "./pages/RecipePage";
import Team from "./pages/Team";

import "./styles/style.css";

const App = () => {
  const location = useLocation();
  const hideFooter = location.pathname === "/yoga";

  return (
    <AuthProvider>
      <div>
        <ScrollToTop />
        <Navbar />
        <Routes>
          {/* Main */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Features */}
          <Route path="/calorie-calculator" element={<CalorieCalculator />} />
          <Route path="/mealplanner" element={<MealPlanning />} />
          <Route path="/aimeal" element={<AIMeal />} />
          <Route path="/pose/:id" element={<PoseDetail />} />
          <Route path="/recipe/:id" element={<RecipePage />} />

          {/* Wellness */}
          <Route path="/yoga" element={<Yoga />} />
          <Route path="/yogaexercise" element={<YogaDownload />} />
          <Route path="/gym" element={<Gym />} />
          <Route path="/exerciselist" element={<ExerciseList />} />

          {/* Informational */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/ourstory" element={<OurStory />} />
          <Route path="/team" element={<Team />} />
        </Routes>

        {!hideFooter && <Footer />}
      </div>
    </AuthProvider>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
