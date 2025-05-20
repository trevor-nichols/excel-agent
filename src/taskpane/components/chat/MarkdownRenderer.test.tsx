import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarkdownRenderer from './MarkdownRenderer';

// Mock react-syntax-highlighter
jest.mock('react-syntax-highlighter', () => ({
  Prism: jest.fn(({ children }) => <pre>{children}</pre>),
}));
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {}, // Mock the style import
}));


describe('MarkdownRenderer', () => {
  // Test Case 1: Basic Markdown Rendering
  it('should render bold text correctly', () => {
    render(<MarkdownRenderer content="**bold text**" />);
    const boldText = screen.getByText('bold text');
    expect(boldText.tagName).toBe('STRONG');
  });

  it('should render italic text correctly', () => {
    render(<MarkdownRenderer content="*italic text*" />);
    const italicText = screen.getByText('italic text');
    expect(italicText.tagName).toBe('EM');
  });

  it('should render links correctly', () => {
    render(<MarkdownRenderer content="[a link](http://example.com)" />);
    const linkElement = screen.getByText('a link');
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('href', 'http://example.com');
  });

  it('should render code blocks correctly', () => {
    const codeContent = "console.log('hello');";
    render(<MarkdownRenderer content={`\`\`\`javascript\n${codeContent}\n\`\`\``} />);
    // Check if SyntaxHighlighter mock (Prism) was called
    expect(require('react-syntax-highlighter').Prism).toHaveBeenCalled();
    // Check for the presence of the code content within a <pre> tag (due to the mock)
    const codeElement = screen.getByText(codeContent);
    expect(codeElement.closest('pre')).toBeInTheDocument();
  });

  // Test Case 2: Worksheet Mention Highlighting
  it('should highlight a single worksheet mention', () => {
    render(<MarkdownRenderer content="Hello @Sheet1" worksheetNames={["Sheet1"]} />);
    const mention = screen.getByText('@Sheet1');
    // The custom component for strong/em might wrap it in a SPAN or directly use STRONG/EM
    // Based on current MarkdownRenderer, it's a SPAN with the class.
    expect(mention.tagName).toBe('SPAN');
    expect(mention).toHaveClass('worksheet-mention');
    expect(screen.getByText('Hello')).toBeInTheDocument(); 
  });

  it('should highlight multiple worksheet mentions', () => {
    render(<MarkdownRenderer content="Check @Sheet1 and @Sheet2" worksheetNames={["Sheet1", "Sheet2"]} />);
    const mention1 = screen.getByText('@Sheet1');
    expect(mention1.tagName).toBe('SPAN');
    expect(mention1).toHaveClass('worksheet-mention');

    const mention2 = screen.getByText('@Sheet2');
    expect(mention2.tagName).toBe('SPAN');
    expect(mention2).toHaveClass('worksheet-mention');
  });

  it('should perform case-sensitive highlighting for mentions', () => {
    render(<MarkdownRenderer content="Hello @sheet1 and @Sheet1" worksheetNames={["Sheet1"]} />);
    
    // @sheet1 should be rendered as strong due to the **@sheet1** conversion but not have the 'worksheet-mention' class
    const incorrectMention = screen.getByText('@sheet1');
    expect(incorrectMention.tagName).toBe('STRONG'); 
    expect(incorrectMention).not.toHaveClass('worksheet-mention');

    // @Sheet1 should be highlighted
    const correctMention = screen.getByText('@Sheet1');
    expect(correctMention.tagName).toBe('SPAN');
    expect(correctMention).toHaveClass('worksheet-mention');
  });
  
  // Test Case 3: No Highlighting Scenarios
  it('should not highlight mentions if worksheetNames is empty', () => {
    render(<MarkdownRenderer content="Hello @Sheet1" worksheetNames={[]} />);
    const mention = screen.getByText('@Sheet1');
    // It will be bolded due to the intermediate **@Sheet1** step
    expect(mention.tagName).toBe('STRONG');
    expect(mention).not.toHaveClass('worksheet-mention');
  });

  it('should not highlight mentions if worksheetNames is not provided', () => {
    render(<MarkdownRenderer content="Hello @Sheet1" />);
    const mention = screen.getByText('@Sheet1');
    // It will be bolded due to the intermediate **@Sheet1** step
    expect(mention.tagName).toBe('STRONG');
    expect(mention).not.toHaveClass('worksheet-mention');
  });

  it('should not highlight unknown worksheet mentions', () => {
    render(<MarkdownRenderer content="Hello @UnknownSheet" worksheetNames={["Sheet1"]} />);
    const mention = screen.getByText('@UnknownSheet');
    // It will be bolded due to the intermediate **@UnknownSheet** step
    expect(mention.tagName).toBe('STRONG');
    expect(mention).not.toHaveClass('worksheet-mention');
  });

  it('should render plain text without mentions correctly', () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    // Check that no worksheet-mention spans are present
    expect(screen.queryByRole('link', { class: /worksheet-mention/i })).toBeNull();
  });

  // Test Case 4: Combined Markdown and Mentions
  it('should render combined markdown and highlighted mentions correctly', () => {
    render(<MarkdownRenderer content="**Important:** check @DataSheet" worksheetNames={["DataSheet"]} />);
    
    const boldText = screen.getByText('Important:');
    expect(boldText.tagName).toBe('STRONG');
    
    const mention = screen.getByText('@DataSheet');
    expect(mention.tagName).toBe('SPAN');
    expect(mention).toHaveClass('worksheet-mention');
    
    // Ensure the text "check" is also present
    expect(screen.getByText(/check/)).toBeInTheDocument();
  });

  it('should render combined markdown (italic) and highlighted mentions correctly', () => {
    render(<MarkdownRenderer content="_Please review_ @FeedbackSheet" worksheetNames={["FeedbackSheet"]} />);
    
    const italicText = screen.getByText('Please review');
    expect(italicText.tagName).toBe('EM');
    
    const mention = screen.getByText('@FeedbackSheet');
    expect(mention.tagName).toBe('SPAN');
    expect(mention).toHaveClass('worksheet-mention');
  });

  it('should handle mentions adjacent to other markdown elements', () => {
    render(<MarkdownRenderer content="**@Sheet1** and *@Sheet2*" worksheetNames={["Sheet1", "Sheet2"]} />);
    
    const mention1 = screen.getByText('@Sheet1');
    expect(mention1.tagName).toBe('SPAN'); // Rendered as a mention
    expect(mention1).toHaveClass('worksheet-mention');
    expect(mention1.closest('strong')).toBeInTheDocument(); // Also wrapped in strong

    const mention2 = screen.getByText('@Sheet2');
    expect(mention2.tagName).toBe('SPAN'); // Rendered as a mention
    expect(mention2).toHaveClass('worksheet-mention');
    expect(mention2.closest('em')).toBeInTheDocument(); // Also wrapped in em
  });

  it('should handle mentions within complex markdown structures', () => {
    render(<MarkdownRenderer content="This is a list:\n\n* Item 1\n* Check @TodoSheet\n* Item 3" worksheetNames={["TodoSheet"]} />);
    
    const mention = screen.getByText('@TodoSheet');
    expect(mention.tagName).toBe('SPAN');
    expect(mention).toHaveClass('worksheet-mention');
    
    // Check if it's part of a list item
    expect(mention.closest('li')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should correctly render multiple identical mentions if they are highlighted', () => {
    render(<MarkdownRenderer content="See @DataSheet and again @DataSheet" worksheetNames={["DataSheet"]} />);
    const mentions = screen.getAllByText('@DataSheet');
    expect(mentions.length).toBe(2);
    mentions.forEach(mention => {
      expect(mention.tagName).toBe('SPAN');
      expect(mention).toHaveClass('worksheet-mention');
    });
  });
  
  it('should correctly render multiple identical mentions if they are NOT highlighted', () => {
    render(<MarkdownRenderer content="See @DataSheet and again @DataSheet" worksheetNames={["OtherSheet"]} />);
    const mentions = screen.getAllByText('@DataSheet');
    expect(mentions.length).toBe(2);
    mentions.forEach(mention => {
      expect(mention.tagName).toBe('STRONG'); // Bolder due to **@DataSheet**
      expect(mention).not.toHaveClass('worksheet-mention');
    });
  });
});
