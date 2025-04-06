# Balance Scale Addition Game - App Flow

This document outlines the user flow and interaction patterns for the Balance Scale Addition Game. It provides a detailed view of how users will navigate through the application and interact with the game mechanics.

## User Types and Journeys

### 1. Student Flow

```
Authentication → Balance Scale Game → View Progress
```

#### Detailed Flow:
1. **Authentication**
   - Student signs in using email/password or Google authentication through Firebase Authentication
   - For younger students, teacher/parent assistance may be required
   - After authentication, student is redirected directly to the balance scale game interface

2. **Play Game**
   - Student is presented with the balance scale interface
   - Target number is displayed on one side of the scale
   - Student enters addends on the other side
   - Visual feedback shows whether the sum is equal, greater, or less than the target
   - Animations and sounds provide engagement and reinforcement
   - Game difficulty adapts based on student performance or educator configuration

3. **Results & Progress**
   - Immediate feedback on correct/incorrect answers
   - Celebration animations for success
   - Option to try again or move to next challenge
   - Progress tracking shows improvement over time

### 2. Educator Flow

```
Authentication → Dashboard → Activity Builder → Student Management → Analytics
```

#### Detailed Flow:
1. **Authentication**
   - Educator signs in with credentials that grant educator privileges

2. **Dashboard**
   - Overview of student progress
   - Quick access to activity builder
   - Notifications about student achievements or challenges

3. **Activity Builder**
   - Create new game configurations
   - Set parameters (target ranges, number of addends, etc.)
   - Preview game experience
   - Save templates for reuse
   - Assign to individual students or groups

4. **Student Management**
   - Add/remove students
   - Create groups
   - Assign activities to students based on their needs
   - View individual student progress

5. **Analytics**
   - Review aggregated performance data
   - Identify common challenges
   - Track improvement over time
   - Generate reports

## Authentication System

### Authentication Screen Options

The authentication screen provides the following clear options:

```
┌─────────────────────────────────────┐
│        Balance Scale Addition       │
│                                     │
│  ┌─────────────┐   ┌─────────────┐  │
│  │  Login as   │   │  Login as   │  │
│  │   Student   │   │  Educator   │  │
│  └─────────────┘   └─────────────┘  │
│                                     │
│  ┌─────────────┐   ┌─────────────┐  │
│  │  Sign up as │   │  Sign up as │  │
│  │   Student   │   │  Educator   │  │
│  └─────────────┘   └─────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Student Sign-up Flow

When a user selects "Sign up as Student":

1. **Basic Information Collection**
   - Collect name, email/username, password
   - Age-appropriate terms and conditions

2. **Educator Linking Option**
   ```
   ┌─────────────────────────────────────┐
   │      Would you like to link with    │
   │         an existing educator?       │
   │                                     │
   │  ┌─────────────┐   ┌─────────────┐  │
   │  │     Yes     │   │     No      │  │
   │  └─────────────┘   └─────────────┘  │
   │                                     │
   └─────────────────────────────────────┘
   ```

3. **If "Yes" is selected:**
   - Prompt for educator code or email
   - Educator receives notification to approve connection
   - Student account is linked to educator's class

4. **If "No" is selected:**
   - Account is created as independent student
   - Game serves pre-configured progressive difficulty levels
   - Learning pace is more gradual for independent learning

### Learning Path Differences

1. **Educator-Linked Students:**
   - Custom difficulty progression set by educator
   - Targeted activities based on identified needs
   - Educator can monitor progress and adjust difficulty
   - Group-based activities and comparisons

2. **Independent Students:**
   - Standard progressive difficulty system
   - Self-paced progression through pre-defined levels
   - More hints and guidance provided automatically
   - Success rate triggers level advancement at a more conservative threshold

## Core Game Interaction Loop

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Display Target  │────>│ Student Inputs   │────>│ Scale Provides  │
│ Number & Scale  │     │ Addends          │     │ Visual Feedback │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
        ^                                                  │
        │                                                  │
        │                                                  v
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Next Challenge  │<────│ Record Progress  │<────│ Validate Answer │
│ or Level Up     │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Game Interaction Details:

1. **Initial State**
   - Scale is balanced horizontally
   - Target number is displayed on the left side
   - Empty input fields are on the right side
   - Clear instructions are provided based on age/level

2. **Input Process**
   - Student enters numbers into the input fields
   - Numbers can be entered via keyboard or touchscreen number pad
   - As numbers are entered, a running sum is calculated

3. **Feedback Mechanism**
   - Scale tilts in real-time based on comparison between sum and target
   - Visual indicators: 
     - Left side down = sum is too small
     - Right side down = sum is too large
     - Balanced = correct answer
   - Color cues reinforce the feedback
   - Animations provide engagement

4. **Completion States**
   - **Success**: Scale balances perfectly, celebration animation plays
   - **Retry**: Option to try again with hints if needed
   - **Next Challenge**: Move to next problem when ready

## Screen Transitions

```
┌────────────────┐                    ┌────────────────┐
│                │                    │                │
│  Auth Screen   │──────────────────>│  Game Interface│
│                │                    │                │
└────────────────┘                    └────────────────┘
                                               │
                                               v
                                      ┌────────────────┐
                                      │                │
                                      │  Results Screen│
                                      │                │
                                      └────────────────┘
                                               │
                                               v
                                      ┌────────────────┐
                                      │                │
                                      │Progress Summary│
                                      │                │
                                      └────────────────┘
```

## Responsive Behavior

The app will adapt to different screen sizes with the following priorities:

1. **Mobile (Portrait)**
   - Scale oriented horizontally
   - Inputs below the scale
   - Large, touch-friendly number pad
   - Simplified UI elements

2. **Tablet**
   - Scale with more detailed visual elements
   - Side-by-side layout for landscape orientation
   - Enhanced animations

3. **Desktop**
   - Full experience with detailed animations
   - Keyboard shortcuts available
   - Enhanced educator tools

## Error Handling and Edge Cases

1. **Connectivity Issues**
   - Local storage of game state
   - Sync when connection is restored
   - Offline play mode for core functionality

2. **Invalid Inputs**
   - Prevent non-numeric entries
   - Input validation with helpful error messages
   - Clear visual indicators for input constraints

3. **Progress Management**
   - Auto-save progress at key points
   - Resume capability if session is interrupted
   - Prevent accidental navigation away during active game

## Accessibility Considerations

1. **Visual Accessibility**
   - High contrast mode
   - Screen reader compatibility
   - Configurable text size

2. **Motor Skills**
   - Alternative input methods
   - Adjustable timing for animations
   - Touch target sizing appropriate for younger users

3. **Cognitive Accessibility**
   - Clear, consistent instructions
   - Multiple formats for feedback (visual, audio)
   - Progressive disclosure of complex concepts

This flow document will guide the implementation of the Balance Scale Addition Game, ensuring a coherent and engaging educational experience that meets the requirements specified in the project documentation. 