import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/styles/globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";

const HomePage: React.FC = () => {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: "#000000",
        color: "#FFFFFF",
      }}
    >
      <Header />
      <main>
        <HeroSection />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
};

export default App;
