import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import "./Layout.css";
import AiChatboat from "./components/aiChatboat/aiChatboat";
import { MobileContext } from "./Context/MobileContext/MobileContext";

const MOBILE_BREAKPOINT = 768;

export default function Layout() {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(currentIsMobile);
      if (!currentIsMobile) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuToggle = () => setIsMobileMenuOpen((prev) => !prev);
  const handleMenuClose = () => setIsMobileMenuOpen(false);

  return (
    <MobileContext.Provider
      value={{
        isMobile,
        isMobileMenuOpen,
        handleMenuToggle,
        handleMenuClose,
      }}
    >
      <div id="layout-container">
        <Navbar
          isMobile={isMobile}
          isOpen={isMobileMenuOpen}
          onClose={handleMenuClose}
        />
        <main>
          <div id="layout-main">
            <Outlet />
          </div>
        </main>
        <AiChatboat />
        {isMobile && isMobileMenuOpen && (
          <div className="mobile-backdrop" onClick={handleMenuClose} />
        )}
      </div>
    </MobileContext.Provider>
  );
}
