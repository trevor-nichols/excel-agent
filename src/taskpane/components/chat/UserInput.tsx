/**
 * File: src/taskpane/components/chat/UserInput.tsx
 * User input component for the chat interface
 * Dependencies: React, FluentUI
 * Used by: ChatInterface component
 */

import * as React from "react";
import {
  Button,
  Textarea,
  Tooltip,
  Badge,
  mergeClasses,
  Text,
} from "@fluentui/react-components";
import { 
  Send24Regular, 
  TabDesktop24Regular
} from "@fluentui/react-icons";
import "./styles/userInput.css";

// Maximum character count
const MAX_CHARS = 1000;

// Props interface for the UserInput component
interface UserInputProps {
  onSendMessage: (text: string, taggedSheets?: string[]) => void;
  worksheetNames: string[];
  disabled?: boolean;
}

// UserInput component
const UserInput: React.FC<UserInputProps> = ({ 
  onSendMessage, 
  worksheetNames,
  disabled = false
}) => {
  const [message, setMessage] = React.useState("");
  const [selectedWorksheets, setSelectedWorksheets] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [filteredWorksheets, setFilteredWorksheets] = React.useState<string[]>([]);
  const [partialTag, setPartialTag] = React.useState("");
  const [cursorPosition, setCursorPosition] = React.useState(0);

  // Character count
  const charCount = message.length;
  const isLimitReached = charCount >= MAX_CHARS;

  // Auto-resize textarea
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle focus on component mount
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  // Filter worksheets based on partial tag
  React.useEffect(() => {
    if (partialTag) {
      const filtered = worksheetNames.filter(name => 
        name.toLowerCase().includes(partialTag.toLowerCase())
      );
      setFilteredWorksheets(filtered);
    } else {
      setFilteredWorksheets([]);
    }
  }, [partialTag, worksheetNames]);

  // Handle sending a message
  const handleSend = () => {
    if (message.trim() && !disabled && !isLimitReached) {
      onSendMessage(message, selectedWorksheets.length > 0 ? selectedWorksheets : undefined);
      setMessage("");
      setSelectedWorksheets([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Check for @ mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, MAX_CHARS);
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    
    // Check if we're typing an @ mention
    const textUpToCursor = newValue.substring(0, cursorPos);
    const atSignIndex = textUpToCursor.lastIndexOf('@');
    
    if (atSignIndex !== -1) {
      const hasSpaceAfterAt = /\s/.test(textUpToCursor.substring(atSignIndex + 1));
      
      if (!hasSpaceAfterAt && atSignIndex === 0 || textUpToCursor[atSignIndex - 1] === ' ') {
        const partial = textUpToCursor.substring(atSignIndex + 1);
        setPartialTag(partial);
        
        if (partial && inputRef.current) {
          // Show menu for @ mentions
          const inputRect = inputRef.current.getBoundingClientRect();
          const lineHeight = parseInt(getComputedStyle(inputRef.current).lineHeight);
          
          // Calculate position based on cursor and text
          const textBeforeCursor = textUpToCursor.substring(0, atSignIndex);
          const lineBreaks = (textBeforeCursor.match(/\n/g) || []).length;
          
          setMenuPosition({
            left: inputRect.left + 10,
            top: inputRect.top + lineHeight * (lineBreaks + 1)
          });
          
          setMenuVisible(true);
        } else {
          setMenuVisible(false);
        }
      } else {
        setMenuVisible(false);
      }
    } else {
      setMenuVisible(false);
    }
    
    setMessage(newValue);
    
    // Update selected worksheets based on @ mentions in the message
    const mentionRegex = /@(\w+)/g;
    const mentions = Array.from(newValue.matchAll(mentionRegex)).map(match => match[1]);
    
    // Filter valid worksheet names
    const validMentions = mentions.filter(mention => 
      worksheetNames.some(name => name.toLowerCase() === mention.toLowerCase())
    );
    
    // Convert to actual worksheet names (preserving case)
    const validWorksheets = validMentions.map(mention => 
      worksheetNames.find(name => name.toLowerCase() === mention.toLowerCase())
    ).filter(Boolean) as string[];
    
    setSelectedWorksheets(Array.from(new Set(validWorksheets)));
  };

  // Handle pressing Enter to send a message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (menuVisible && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      // Prevent default to avoid cursor movement in textarea
      e.preventDefault();
      return;
    }
    
    if (menuVisible && e.key === 'Tab') {
      e.preventDefault();
      if (filteredWorksheets.length > 0) {
        completeWorksheetMention(filteredWorksheets[0]);
      }
      return;
    }
    
    if (menuVisible && e.key === 'Enter') {
      e.preventDefault();
      if (filteredWorksheets.length > 0) {
        completeWorksheetMention(filteredWorksheets[0]);
      }
      return;
    }
    
    if (menuVisible && e.key === 'Escape') {
      setMenuVisible(false);
      return;
    }
    
    if (!menuVisible && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Complete the worksheet mention
  const completeWorksheetMention = (worksheetName: string) => {
    const textUpToCursor = message.substring(0, cursorPosition);
    const atSignIndex = textUpToCursor.lastIndexOf('@');
    
    if (atSignIndex !== -1) {
      const beforeAt = message.substring(0, atSignIndex);
      const afterCursor = message.substring(cursorPosition);
      
      const newMessage = `${beforeAt}@${worksheetName} ${afterCursor}`;
      setMessage(newMessage);
      
      // Update selected worksheets
      if (!selectedWorksheets.includes(worksheetName)) {
        setSelectedWorksheets(prev => [...prev, worksheetName]);
      }
      
      // Hide menu
      setMenuVisible(false);
      
      // Set cursor position after the completed mention
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = atSignIndex + worksheetName.length + 2; // +2 for @ and space
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
        }
      }, 0);
    }
  };

  // Toggle worksheet selection
  const toggleWorksheet = (worksheet: string) => {
    setSelectedWorksheets((prev) => 
      prev.includes(worksheet)
        ? prev.filter(ws => ws !== worksheet)
        : [...prev, worksheet]
    );
  };

  // Insert worksheet tag into message
  const insertWorksheetTag = (worksheet: string) => {
    if (!message.includes(`@${worksheet}`)) {
      setMessage((prev) => `${prev}${prev.endsWith(" ") || prev === "" ? "" : " "}@${worksheet} `);
      // Also select the worksheet
      if (!selectedWorksheets.includes(worksheet)) {
        setSelectedWorksheets(prev => [...prev, worksheet]);
      }
    }
    inputRef.current?.focus();
  };

  return (
    <div className="user-input-container">
      {worksheetNames.length > 0 && (
        <div className="worksheet-tags">
          {worksheetNames.map((worksheet) => {
            const isActive = selectedWorksheets.includes(worksheet);
            return (
              <Tooltip 
                content={
                  <div className="tooltip-content">
                    {isActive 
                      ? `Remove @${worksheet} from your message` 
                      : `Tag @${worksheet} in your message`}
                  </div>
                }
                key={worksheet}
                relationship="label"
              >
                <div
                  className={mergeClasses(
                    "worksheet-tag", 
                    isActive ? "active-tag" : undefined
                  )}
                  onClick={() => insertWorksheetTag(worksheet)}
                >
                  <Text>{worksheet}</Text>
                  {isActive && <Badge appearance="filled" className="badge" />}
                </div>
              </Tooltip>
            );
          })}
        </div>
      )}
      
      <div className="user-input-row">
        <Textarea
          ref={inputRef}
          className="user-input-textarea"
          placeholder="Type your message here... Use @worksheet to tag a specific sheet"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          size="large"
        />
        
        {/* @ mention dropdown menu */}
        {menuVisible && filteredWorksheets.length > 0 && (
          <div 
            className="worksheet-menu-container"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {filteredWorksheets.map((name) => (
              <div 
                key={name} 
                className="worksheet-menu-item"
                onClick={() => completeWorksheetMention(name)}
              >
                {name}
              </div>
            ))}
          </div>
        )}
        
        {message.length > 0 && (
          <div className={mergeClasses(
            "character-count", 
            isLimitReached ? "limit-reached" : undefined
          )}>
            {charCount}/{MAX_CHARS}
          </div>
        )}
        
        <div className="buttons-container">
          <Tooltip 
            content="Send message"
            relationship="label"
          >
            <Button
              className="input-button"
              appearance="primary"
              icon={<Send24Regular />}
              onClick={handleSend}
              disabled={disabled || message.trim() === "" || isLimitReached}
              aria-label="Send message"
            />
          </Tooltip>
        </div>
      </div>
      
      {selectedWorksheets.length > 0 && (
        <div className="mention-container">
          {selectedWorksheets.map(sheet => (
            <span key={sheet} className="mention-tag">
              @{sheet}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserInput;
