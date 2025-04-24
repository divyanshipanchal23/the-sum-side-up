# Testing Plan for Balance Scale Addition Game

This document outlines the manual testing procedures to ensure all features of the Balance Scale Addition Game are working correctly before we proceed with containerization.

## 1. Authentication Testing

- [ ] **User Registration**
  - Create a new account with email/password
  - Verify email validation
  - Test password strength requirements
  - Verify successful registration message

- [ ] **User Login**
  - Log in with registered credentials
  - Test "Remember Me" functionality if implemented
  - Test incorrect credentials error handling
  - Verify login with Google

- [ ] **Password Reset**
  - Request password reset
  - Verify email is sent (or simulated in development)
  - Complete password reset process

- [ ] **Authentication State**
  - Verify persistence of login state on refresh
  - Test automatic redirection for protected routes
  - Verify logout functionality

## 2. Game Mechanics Testing

- [ ] **Balance Scale Visualization**
  - Verify scale properly displays with different values
  - Test tilting animations when values are unequal
  - Check visual feedback clarity

- [ ] **Number Input**
  - Test keyboard input for numbers
  - Verify increment/decrement buttons
  - Test min/max value constraints
  - Verify error handling for invalid inputs

- [ ] **Game Logic**
  - Verify correct calculation of sums
  - Test matching input sums with target values
  - Verify win/lose conditions
  - Test progression between levels

- [ ] **Visual Feedback**
  - Verify color changes for correct/incorrect answers
  - Test animations for success/failure
  - Check accessibility of visual indicators

## 3. Activity Configuration Testing

- [ ] **Configuration Interface**
  - Test creating a new activity configuration
  - Verify all configuration options can be set
  - Test saving and loading configurations

- [ ] **Difficulty Settings**
  - Verify setting different number ranges
  - Test configuring number of addends
  - Verify time limit settings
  - Test hint availability toggles

- [ ] **Progression Rules**
  - Test setting advancement thresholds
  - Verify required success rate configurations
  - Test progression between difficulty levels

## 4. Progress Tracking Testing

- [ ] **User Statistics**
  - Verify recording of attempts
  - Test success rate calculations
  - Check time spent tracking

- [ ] **History View**
  - Test viewing past attempts
  - Verify filtering and sorting options
  - Check data visualization if implemented

## 5. Performance Testing

- [ ] **Loading Times**
  - Measure initial load time
  - Test route transition performance
  - Verify asset preloading effectiveness

- [ ] **Responsiveness**
  - Test on multiple screen sizes (mobile, tablet, desktop)
  - Verify UI adaptability
  - Check touch interactions on mobile

## 6. Error Handling Testing

- [ ] **Network Issues**
  - Test app behavior with no internet connection
  - Verify recovery when connection is restored
  - Check error messaging

- [ ] **Input Validation**
  - Test form validation for all inputs
  - Verify appropriate error messages
  - Check boundary conditions

## 7. Integration Testing

- [ ] **Firebase Integration**
  - Verify authentication flows with Firebase
  - Test data persistence in Firestore
  - Check configuration storage and retrieval

- [ ] **API Integration**
  - Test backend API calls
  - Verify error handling for API failures
  - Check authentication token handling

## Testing Checklist Completion

After completing all tests:

1. Document any bugs or issues found
2. Fix identified issues
3. Re-test affected features
4. When all tests pass, proceed with containerization

## Notes for Testers

- Use Chrome DevTools for performance monitoring
- Test in both development and production builds
- Document browser and device information for any issues
- Focus on edge cases and unexpected user behaviors 