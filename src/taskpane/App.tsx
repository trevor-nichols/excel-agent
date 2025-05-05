import * as React from "react";
import ChatInterface from "./components/chat/ChatInterface";
import Header from "./components/shared/Header";
import SplashScreen from "./components/shared/SplashScreen";
import { AppProps } from "./types";
import "./styles/global.css";

const App: React.FC<AppProps> = (props) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [showSplash, setShowSplash] = React.useState<boolean>(true);
  const [splashOpacity, setSplashOpacity] = React.useState<number>(1);
  
  // Effect to handle splash screen animation
  React.useEffect(() => {
    // Start fade out after 2 seconds
    const timer1 = setTimeout(() => {
      setSplashOpacity(0);
    }, 2000);
    
    // Remove from DOM after fade out completes
    const timer2 = setTimeout(() => {
      setShowSplash(false);
      setIsLoading(false);
    }, 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  return (
    <div id="app-container">
      {showSplash && <SplashScreen opacity={splashOpacity} />}
      
      <Header 
        logo="assets/logo.png" 
        title={props.title || "Excel Assistant"} 
      />
      
      <ChatInterface 
        setIsLoading={setIsLoading} 
      />
    </div>
  );
};

export default App;
