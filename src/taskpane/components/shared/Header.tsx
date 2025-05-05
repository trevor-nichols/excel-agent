/**
 * File: src/taskpane/components/shared/Header.tsx
 * Header component for the application
 * Dependencies: React, FluentUI
 * Used by: App component
 */

import * as React from "react";
import { 
  Image, 
  Text, 
  Tooltip, 
  Button
} from "@fluentui/react-components";
import { Settings24Regular, QuestionCircle24Regular } from "@fluentui/react-icons";
import "./styles/header.css";

// Props interface for the Header component
interface HeaderProps {
  logo: string;
  title: string;
  onHelpClick?: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  logo, 
  title, 
  onHelpClick, 
  onSettingsClick 
}) => {
  return (
    <header className="header">
      <div className="logo-container">
        <Image className="logo" src={logo} alt="Logo" />
        <Text className="title">{title}</Text>
      </div>
      
      <div className="header-actions">
        {onHelpClick && (
          <Tooltip content="Help" relationship="label">
            <button 
              className="header-button" 
              onClick={onHelpClick}
              aria-label="Help"
            >
              <QuestionCircle24Regular />
            </button>
          </Tooltip>
        )}
        
        {onSettingsClick && (
          <Tooltip content="Settings" relationship="label">
            <button 
              className="header-button" 
              onClick={onSettingsClick}
              aria-label="Settings"
            >
              <Settings24Regular />
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
};

export default Header;
