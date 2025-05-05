/**
 * File: src/taskpane/components/shared/SplashScreen.tsx
 * Splash screen component displayed during application loading
 * Dependencies: React
 * Used by: App component
 */

import * as React from "react";
import { Text } from "@fluentui/react-components";
import "./styles/splashScreen.css";

// Props interface for the SplashScreen component
interface SplashScreenProps {
  opacity: number;
  productName?: string;
  message?: string;
}

/**
 * SplashScreen component shown during initial application loading
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ 
  opacity, 
  productName = "Excel AI Assistant", 
  message = "Starting up..." 
}) => {
  // Determine the class based on opacity
  const fadeClass = opacity === 0 ? "fade-out" : "";
  
  return (
    <div className={`splash-screen ${fadeClass}`}>
      <div className="spinner-container">
        <img src="assets/loading_spinner.png" alt="Loading" className="spinner" />
        <Text className="splash-title">{productName}</Text>
        <Text className="splash-subtitle">{message}</Text>
      </div>
    </div>
  );
};

export default SplashScreen;
