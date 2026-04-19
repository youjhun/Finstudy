/** @type {const} */
// Green Theme with White Background
// Primary: Light Green (#A8D5BA)
// Background: Pure White (#FFFFFF)
const themeColors = {
  // Primary: Light Green (연한 초록색)
  primary: { light: '#A8D5BA', dark: '#81C995' },
  
  // Background: Pure White
  background: { light: '#FFFFFF', dark: '#FFFFFF' },
  
  // Surface: Pure White (보조 컬러)
  surface: { light: '#FFFFFF', dark: '#FFFFFF' },
  
  // Foreground: Dark Gray/Black
  foreground: { light: '#1A1A1A', dark: '#1A1A1A' },
  
  // Muted: Medium Gray
  muted: { light: '#6B7A72', dark: '#6B7A72' },
  
  // Border: Light Gray
  border: { light: '#E5E5E5', dark: '#E5E5E5' },
  
  // Success: Green
  success: { light: '#52C77E', dark: '#52C77E' },
  
  // Warning: Amber
  warning: { light: '#FFC107', dark: '#FFC107' },
  
  // Error: Red
  error: { light: '#F44336', dark: '#F44336' },
};

module.exports = { themeColors };
