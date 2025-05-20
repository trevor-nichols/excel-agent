import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageItem from './MessageItem';
import { Person24Regular, TabDesktop24Regular } from "@fluentui/react-icons";

// Mock MarkdownRenderer
jest.mock("./MarkdownRenderer", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown-renderer">{children}</div>,
}));

// Mock Fluent UI Icons to make them easier to find in tests
jest.mock("@fluentui/react-icons", () => {
  const originalModule = jest.requireActual("@fluentui/react-icons");
  return {
    ...originalModule,
    Person24Regular: (props: any) => <svg data-testid="person-icon" {...props} />,
    TabDesktop24Regular: (props: any) => <svg data-testid="desktop-icon" {...props} />,
  };
});


describe('MessageItem', () => {
  const mockWorksheetNames = ["Sheet1", "Sheet2", "Data", "Budget"];

  // Test Case 1: User Message Rendering
  describe('User Message', () => {
    beforeEach(() => {
      render(
        <MessageItem isUser={true} worksheetNames={mockWorksheetNames}>
          Hello from user
        </MessageItem>
      );
    });

    it('displays sender as "You"', () => {
      expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('applies user-specific CSS classes', () => {
      const messageItemDiv = screen.getByText('You').closest('div.message-item');
      expect(messageItemDiv).toHaveClass('user-message');
      
      const avatarDiv = screen.getByTestId('person-icon').closest('div');
      expect(avatarDiv).toHaveClass('avatar', 'user-avatar');
    });

    it('renders Person24Regular icon', () => {
      expect(screen.getByTestId('person-icon')).toBeInTheDocument();
    });

    it('passes message content to MarkdownRenderer', () => {
      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('Hello from user');
    });
  });

  // Test Case 2: Assistant Message Rendering
  describe('Assistant Message', () => {
    beforeEach(() => {
      render(
        <MessageItem isUser={false} worksheetNames={mockWorksheetNames}>
          Hello from assistant
        </MessageItem>
      );
    });

    it('displays sender as "Excel Assistant"', () => {
      expect(screen.getByText('Excel Assistant')).toBeInTheDocument();
    });

    it('applies assistant-specific CSS classes', () => {
      const messageItemDiv = screen.getByText('Excel Assistant').closest('div.message-item');
      expect(messageItemDiv).toHaveClass('assistant-message');

      const avatarDiv = screen.getByTestId('desktop-icon').closest('div');
      expect(avatarDiv).toHaveClass('avatar', 'assistant-avatar');
    });

    it('renders TabDesktop24Regular icon', () => {
      expect(screen.getByTestId('desktop-icon')).toBeInTheDocument();
    });

    it('passes message content to MarkdownRenderer', () => {
      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('Hello from assistant');
    });
  });

  // Test Case 3: Tagged Worksheets Display
  describe('Tagged Worksheets', () => {
    it('displays badges for tagged worksheets in a user message', () => {
      render(
        <MessageItem isUser={true} worksheetNames={mockWorksheetNames} taggedWorksheets={["Sheet1", "Data"]}>
          User message with tags
        </MessageItem>
      );
      const badgesContainer = screen.getByText('User message with tags').closest('.message-content')?.querySelector('.worksheet-badges');
      expect(badgesContainer).toBeInTheDocument();
      expect(within(badgesContainer as HTMLElement).getByText('@Sheet1')).toBeInTheDocument();
      expect(within(badgesContainer as HTMLElement).getByText('@Data')).toBeInTheDocument();
    });

    it('displays badges for tagged worksheets in an assistant message', () => {
      render(
        <MessageItem isUser={false} worksheetNames={mockWorksheetNames} taggedWorksheets={["Sheet2", "Budget"]}>
          Assistant message with tags
        </MessageItem>
      );
      const badgesContainer = screen.getByText('Assistant message with tags').closest('.message-content')?.querySelector('.worksheet-badges');
      expect(badgesContainer).toBeInTheDocument();
      expect(within(badgesContainer as HTMLElement).getByText('@Sheet2')).toBeInTheDocument();
      expect(within(badgesContainer as HTMLElement).getByText('@Budget')).toBeInTheDocument();
    });

    it('does not display badges if taggedWorksheets is empty', () => {
      render(
        <MessageItem isUser={true} worksheetNames={mockWorksheetNames} taggedWorksheets={[]}>
          Message without tags
        </MessageItem>
      );
      const badgesContainer = screen.getByText('Message without tags').closest('.message-content')?.querySelector('.worksheet-badges');
      expect(badgesContainer?.children.length || 0).toBe(0);
    });

    it('does not display badges if taggedWorksheets is not provided', () => {
      render(
        <MessageItem isUser={false} worksheetNames={mockWorksheetNames}>
          Another message without tags
        </MessageItem>
      );
      const badgesContainer = screen.getByText('Another message without tags').closest('.message-content')?.querySelector('.worksheet-badges');
      expect(badgesContainer?.children.length || 0).toBe(0);
    });
  });

  // Test Case 4: Message Content Propagation
  describe('Message Content', () => {
    it('correctly renders the message content via MarkdownRenderer', () => {
      const testMessage = "This is a specific test message for content propagation.";
      render(
        <MessageItem isUser={true} worksheetNames={mockWorksheetNames}>
          {testMessage}
        </MessageItem>
      );
      const markdownRenderer = screen.getByTestId('markdown-renderer');
      expect(markdownRenderer).toHaveTextContent(testMessage);
    });

    it('renders complex children if passed (though typically text)', () => {
      const complexMessage = (
        <span>
          Part 1 and <b>Part 2</b>
        </span>
      );
      render(
        <MessageItem isUser={false} worksheetNames={mockWorksheetNames}>
          {complexMessage}
        </MessageItem>
      );
      const markdownRenderer = screen.getByTestId('markdown-renderer');
      expect(markdownRenderer).toHaveTextContent("Part 1 and Part 2");
      expect(screen.getByText('Part 1 and')).toBeInTheDocument(); // Check specific part
      expect(screen.getByText('Part 2').tagName).toBe('B'); // Check bolded part
    });
  });
});
