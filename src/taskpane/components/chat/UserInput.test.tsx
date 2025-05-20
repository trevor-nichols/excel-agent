import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UserInput from './UserInput';

// Mock Fluent UI Icons
jest.mock("@fluentui/react-icons", () => ({
  ...jest.requireActual("@fluentui/react-icons"), // Preserve other exports
  Send24Regular: () => <div data-testid="send-icon" />,
  TabDesktop24Regular: () => <div data-testid="desktop-icon" /> // Mocking this as well in case UserInput uses it internally or in a sub-component implicitly
}));

const MAX_CHARS = 1000; // As defined in UserInput.tsx

describe('UserInput Component', () => {
  let mockOnSendMessage: jest.Mock;

  beforeEach(() => {
    mockOnSendMessage = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Input Handling and State
  describe('Input Handling and State', () => {
    it('updates textarea value on typing', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      await user.type(textarea, 'Hello world');
      expect(textarea).toHaveValue('Hello world');
    });

    it('updates character count on typing', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      await user.type(textarea, 'test');
      expect(screen.getByText(`4/${MAX_CHARS}`)).toBeInTheDocument();
    });

    it('restricts input to MAX_CHARS', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      const longText = 'a'.repeat(MAX_CHARS + 10);
      await user.type(textarea, longText);
      expect(textarea).toHaveValue('a'.repeat(MAX_CHARS));
      expect(screen.getByText(`${MAX_CHARS}/${MAX_CHARS}`)).toBeInTheDocument();
      expect(screen.getByText(`${MAX_CHARS}/${MAX_CHARS}`)).toHaveClass('limit-reached');
    });
  });

  // Test Case 2: Send Message Functionality
  describe('Send Message Functionality', () => {
    it('calls onSendMessage with message text and clears input on send button click', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      const sendButton = screen.getByRole('button', { name: /Send message/i });

      await user.type(textarea, 'Test message');
      await user.click(sendButton);

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', undefined);
      expect(textarea).toHaveValue('');
    });

    it('calls onSendMessage on Enter key press (without Shift)', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      
      await user.type(textarea, 'Message on enter');
      await user.keyboard('{Enter}');
      
      expect(mockOnSendMessage).toHaveBeenCalledWith('Message on enter', undefined);
      expect(textarea).toHaveValue('');
    });

    it('creates a new line on Shift+Enter, does not send', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      
      await user.type(textarea, 'Line 1');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      await user.type(textarea, 'Line 2');

      expect(textarea).toHaveValue('Line 1\nLine 2');
      expect(mockOnSendMessage).not.toHaveBeenCalled();
    });
  });

  // Test Case 3: Send Button Disabling
  describe('Send Button Disabling', () => {
    it('is disabled when input is empty', () => {
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const sendButton = screen.getByRole('button', { name: /Send message/i });
      expect(sendButton).toBeDisabled();
    });

    it('is disabled when disabled prop is true', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} disabled={true} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      await user.type(textarea, 'Some text');
      const sendButton = screen.getByRole('button', { name: /Send message/i });
      expect(sendButton).toBeDisabled();
    });
    
    it('is disabled when MAX_CHARS is exceeded', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      const sendButton = screen.getByRole('button', { name: /Send message/i });
      
      const longText = 'a'.repeat(MAX_CHARS + 1);
      // Directly setting value because typing char by char is slow and might not trigger the limit in the same way for the button state
      fireEvent.change(textarea, { target: { value: longText.slice(0, MAX_CHARS +1) } });
      
      // Wait for state updates if any (though UserInput updates it synchronously for length check)
      await waitFor(() => expect(textarea).toHaveValue('a'.repeat(MAX_CHARS)));
      expect(sendButton).toBeDisabled();
    });

    it('is enabled when text is present and not otherwise disabled', async () => {
      const user = userEvent.setup();
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      const sendButton = screen.getByRole('button', { name: /Send message/i });
      
      await user.type(textarea, 'Valid message');
      expect(sendButton).toBeEnabled();
    });
  });

  // Test Case 4: @mention Autocomplete Popup
  describe('@mention Autocomplete Popup', () => {
    const worksheetNames = ["Sheet1", "SheetAlpha", "AnotherSheet"];
    jest.useFakeTimers();

    it('shows and filters worksheet suggestions on @ typing', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);

      await user.type(textarea, '@');
      // Menu might not appear with just "@" or might be empty.
      // The component logic shows menu if partialTag is non-empty.
      // So, typing "@S" is a better test for visibility.
      expect(document.querySelector('.worksheet-menu-container')).toBeNull();

      await user.type(textarea, 'S'); // textarea now is "@S"
      
      act(() => { jest.runAllTimers(); }); // For any debounces or async updates for menu visibility

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeVisible();
        expect(screen.getByText('SheetAlpha')).toBeVisible();
      });
      expect(document.querySelector('.worksheet-menu-container')).toBeInTheDocument();
      expect(screen.queryByText('AnotherSheet')).toBeNull();
    });

    it('shows specific match when typing full name like @Sheet1', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      
      await user.type(textarea, '@Sheet1');
      act(() => { jest.runAllTimers(); });

      await waitFor(() => {
        expect(screen.getByText('Sheet1')).toBeVisible();
      });
      expect(screen.queryByText('SheetAlpha')).toBeNull();
      expect(screen.queryByText('AnotherSheet')).toBeNull();
    });

    it('selects worksheet from menu on click, updates input, and hides menu', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);

      await user.type(textarea, '@S');
      act(() => { jest.runAllTimers(); });
      
      let sheet1Option: HTMLElement;
      await waitFor(() => {
        sheet1Option = screen.getByText('Sheet1');
        expect(sheet1Option).toBeVisible();
      });
      
      await user.click(sheet1Option!);
      act(() => { jest.runAllTimers(); }); // For focus and state updates after click

      await waitFor(() => {
        expect(textarea).toHaveValue('@Sheet1 '); // Note the trailing space
      });
      expect(document.querySelector('.worksheet-menu-container')).toBeNull();
    });

    it('selects worksheet using Enter key and hides menu', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);

      await user.type(textarea, '@SheetAlpha');
      act(() => { jest.runAllTimers(); });

      await waitFor(() => expect(screen.getByText('SheetAlpha')).toBeVisible());
      
      // Simulate Enter key press on the textarea (event bubbles to menu handler if menu is active)
      // The component's keydown handler on textarea should handle this when menu is visible
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
      act(() => { jest.runAllTimers(); });

      await waitFor(() => {
        expect(textarea).toHaveValue('@SheetAlpha ');
      });
      expect(document.querySelector('.worksheet-menu-container')).toBeNull();
    });
    
    it('selects worksheet using Tab key and hides menu', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);

      await user.type(textarea, '@SheetA'); // Should match SheetAlpha and AnotherSheet
      act(() => { jest.runAllTimers(); });

      await waitFor(() => {
        expect(screen.getByText('SheetAlpha')).toBeVisible();
        expect(screen.getByText('AnotherSheet')).toBeVisible();
      });
      
      // Tab should select the first item (SheetAlpha)
      fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });
      act(() => { jest.runAllTimers(); });

      await waitFor(() => {
        expect(textarea).toHaveValue('@SheetAlpha ');
      });
      expect(document.querySelector('.worksheet-menu-container')).toBeNull();
    });

    it('hides menu on Escape key', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);

      await user.type(textarea, '@S');
      act(() => { jest.runAllTimers(); });
      await waitFor(() => expect(screen.getByText('Sheet1')).toBeVisible());

      // Simulate Escape key press
      fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });
      act(() => { jest.runAllTimers(); });

      await waitFor(() => {
        expect(document.querySelector('.worksheet-menu-container')).toBeNull();
      });
    });

    it('does not show menu if text after @ does not match', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);

      await user.type(textarea, '@XYZ');
      act(() => { jest.runAllTimers(); });

      // Menu should not be visible or should be empty
      // Depending on implementation, it might briefly appear then disappear or just not appear.
      // A robust check is that no items are visible.
      await waitFor(() => {
        expect(document.querySelector('.worksheet-menu-container')).toBeNull();
      });
       // Or if it can be empty:
      const menu = document.querySelector('.worksheet-menu-container');
      if (menu) {
        expect(menu.children.length).toBe(0);
      }
    });
    jest.useRealTimers();
  });

  // Test Case 5: Worksheet Tag Buttons
  describe('Worksheet Tag Buttons', () => {
    const worksheetNames = ["Sheet1", "SheetAlpha"];
    jest.useFakeTimers();

    it('renders tag buttons for each worksheet', () => {
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      expect(screen.getByText('Sheet1').closest('.worksheet-tag')).toBeInTheDocument();
      expect(screen.getByText('SheetAlpha').closest('.worksheet-tag')).toBeInTheDocument();
    });

    it('clicking a tag button appends @Worksheet to input, activates tag, and sets for onSendMessage', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      const sheet1TagButton = screen.getByText('Sheet1').closest('.worksheet-tag');
      
      expect(sheet1TagButton).not.toHaveClass('active-tag');
      await user.click(sheet1TagButton!);
      act(() => { jest.runAllTimers(); }); // For focus update

      expect(textarea).toHaveValue('@Sheet1 ');
      expect(sheet1TagButton).toHaveClass('active-tag');

      // Now type something and send
      await user.type(textarea, 'hello'); // textarea is now '@Sheet1 hello'
      const sendButton = screen.getByRole('button', { name: /Send message/i });
      await user.click(sendButton);
      
      expect(mockOnSendMessage).toHaveBeenCalledWith('@Sheet1 hello', ['Sheet1']);
    });

    it('correctly reflects typed mentions and clicked tags in onSendMessage', async () => {
      const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      const sheetAlphaTagButton = screen.getByText('SheetAlpha').closest('.worksheet-tag');

      // Type a mention
      await user.type(textarea, 'Check @Sheet1 and ');
      act(() => { jest.runAllTimers(); }); // for mention processing

      // Click another tag
      await user.click(sheetAlphaTagButton!); // appends @SheetAlpha 
      act(() => { jest.runAllTimers(); });

      const sendButton = screen.getByRole('button', { name: /Send message/i });
      await user.click(sendButton);

      // Expected message: "Check @Sheet1 and @SheetAlpha " (note potential double space if not handled by component)
      // The component's logic should correctly identify Sheet1 and SheetAlpha as selected.
      // The current component logic might result in "Check @Sheet1 and @SheetAlpha  "
      // Let's check what's sent to onSendMessage for selectedWorksheets
      expect(mockOnSendMessage).toHaveBeenCalledWith(expect.stringContaining('@Sheet1'), expect.arrayContaining(['Sheet1', 'SheetAlpha']));
      expect(mockOnSendMessage).toHaveBeenCalledWith(expect.stringContaining('@SheetAlpha'), expect.arrayContaining(['Sheet1', 'SheetAlpha']));
      
      // Check that both are selected
      const sentArgs = mockOnSendMessage.mock.calls[0];
      expect(sentArgs[1]).toEqual(expect.arrayContaining(['Sheet1', 'SheetAlpha']));
      expect(sentArgs[1]?.length).toBe(2); // Ensure no duplicates if logic is sound
    });

    it('typing a new message after sending with tags clears previous tag selections for the new message', async () => {
        const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={worksheetNames} />);
        const textarea = screen.getByPlaceholderText(/Type your message here/i);
        const sheet1TagButton = screen.getByText('Sheet1').closest('.worksheet-tag');
  
        // First message with a tag
        await user.click(sheet1TagButton!); // Appends @Sheet1
        act(() => { jest.runAllTimers(); });
        await user.type(textarea, 'message 1');
        await user.click(screen.getByRole('button', { name: /Send message/i }));
        expect(mockOnSendMessage).toHaveBeenCalledWith('@Sheet1 message 1', ['Sheet1']);
        expect(textarea).toHaveValue(''); // Cleared after send
        expect(sheet1TagButton).not.toHaveClass('active-tag'); // Assuming tags reset visually too
  
        // Second message without tags
        await user.type(textarea, 'message 2');
        await user.click(screen.getByRole('button', { name: /Send message/i }));
        expect(mockOnSendMessage).toHaveBeenCalledWith('message 2', undefined);
    });
    jest.useRealTimers();
  });

  // Test Case 6: Focus and Initial State
  describe('Focus and Initial State', () => {
    jest.useFakeTimers();
    it('should focus the textarea on mount after a short delay', () => {
      render(<UserInput onSendMessage={mockOnSendMessage} worksheetNames={[]} />);
      const textarea = screen.getByPlaceholderText(/Type your message here/i);
      
      // Initially, it might not be focused immediately due to setTimeout(..., 0) or other microtasks
      // However, the component uses setTimeout(..., 300)
      expect(document.activeElement).not.toBe(textarea);
      
      act(() => {
        jest.runAllTimers(); // Advance timers used by setTimeout
      });
      
      expect(document.activeElement).toBe(textarea);
    });
    jest.useRealTimers();
  });
});
