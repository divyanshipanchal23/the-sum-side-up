# Learning Journey: Balance Scale Addition Game

This document will track my learning process, technical challenges, and thought process as I build the Balance Scale Addition Game. I'll update it throughout the development journey.

## Project Setup and Initial Thoughts

### Day 1: Project Planning

Today I spent time deeply understanding the requirements and planning the architecture for this educational game. I've decided to set a challenging but achievable timeline of 10 days, dedicating 4-5 hours daily to this project.

Some key insights and learnings:

1. **Educational Design Principles**: Building effective educational software requires a balance between engagement and pedagogical value. The balance scale metaphor is powerful because it leverages physical intuition to teach abstract math concepts.

2. **Technical Stack Considerations**: 
   - **Vue.js**: I'll be using Vue 3 with Composition API (open source), which offers better TypeScript integration and more flexible component logic organization than the Options API.
   - **FastAPI**: Provides strong typing via Pydantic (open source), which will help ensure data consistency between frontend and backend.
   - **Firebase**: Authentication flow needs to be carefully designed to maintain security while providing a smooth user experience (required tech stack).

3. **Visual Design Challenge**: Creating an intuitive, visually engaging balance scale that provides clear feedback will be a key challenge. I'm considering several approaches to the animation:
   - CSS transitions for simple tilting (open source browser API)
   - Canvas-based animation for more complex physics (open source browser API)
   - SVG manipulation with anime.js (open source) or Web Animations API for a balance of performance and visual quality

4. **User Experience Questions**: 
   - How to make the feedback appropriate for different age groups?
   - What's the right balance between handholding and challenge?
   - How to ensure the interface is intuitive enough that children can use it without extensive instructions?

5. **Accelerated Timeline Considerations**:
   - I'll need to focus on the core game mechanics first before adding polish
   - Firebase will be leveraged for both authentication and data storage to simplify backend integration (required tech stack)
   - Each day's progress needs to build toward a working product by day 10
   - I'll prioritize functionality over perfect visuals initially

## Design Decisions

### Visual Feedback System

I'm planning to implement a multi-layered feedback system:

1. **Immediate Physical Feedback**: The scale tilts to show if the sum is too high or too low
2. **Visual Cues**: Color changes and subtle animations to reinforce correct/incorrect answers
3. **Progression Indicators**: Clear tracking of progress to motivate continued engagement

### Technical Architecture

I'm choosing to separate the game logic from the presentation layer, which will allow:
- Easier testing of core game mechanics using Vitest (open source)
- Potential reuse of game logic in different visual presentations
- Clearer separation of concerns

## Challenges Anticipated

1. **Animation Performance**: Ensuring smooth animations across devices, especially on lower-end mobile devices - will use requestAnimationFrame and CSS transforms (open source browser APIs)
2. **State Management Complexity**: Managing game state, user progress, and configuration will require careful design - will leverage Pinia (open source)
3. **Responsive Design**: Creating an experience that works well on everything from small phone screens to large desktop displays - will use Tailwind CSS (open source)
4. **Balancing Configurability**: Making the activity builder powerful enough for educators while keeping it simple to use
5. **Time Management**: Completing all required functionality within the 10-day timeline while maintaining code quality

I'll update this document daily as I make progress, encounter and solve challenges, and learn new things throughout the development process. 

### Day 2: Core UI Components & Data Models

Today I focused on building the foundational components for the game. I've successfully created:

1. **BalanceScale Component**: I implemented a visually appealing balance scale that:
   - Uses CSS transforms and transitions for smooth tilting animation
   - Provides clear visual feedback about which side is heavier
   - Applies non-linear scaling to the tilt angle to make small differences more noticeable
   - Uses reactive Vue props to update in real-time as values change

2. **NumberInput Component**: I created a versatile number input that:
   - Includes increment/decrement buttons for easy value adjustment
   - Provides direct input for precise value entry
   - Features "quick number" buttons for commonly used values
   - Uses Vue's v-model for seamless two-way binding

3. **Game State Management**: I've developed a robust state management system using Pinia that:
   - Tracks the current game state including target number, user inputs, and score
   - Provides computed properties for derived values like sum and balance status
   - Includes actions for updating addends, checking balance, and starting new games
   - Implements level progression logic with difficulty scaling

4. **Backend Models and API**: On the backend side, I've defined:
   - Pydantic models for game configuration, user progress, and game sessions
   - API endpoints for creating and retrieving game configurations
   - Logic for recording and tracking user attempts

### Day 3: Technical Challenges & Solutions

While implementing the core game mechanics, I encountered several interesting challenges:

1. **ES Module Compatibility**: 
   - **Challenge**: The project uses ES modules (`"type": "module"` in package.json), but some configuration files needed Node.js path utilities like `__dirname` which aren't available in ES modules.
   - **Solution**: I adapted the code to use ES module-compatible alternatives with `import.meta.url` and `fileURLToPath`.

2. **Tailwind CSS Configuration**:
   - **Challenge**: The Tailwind CSS configuration wasn't properly detecting content files, leading to missing styles.
   - **Solution**: I updated the configuration to use absolute paths with proper ES module path resolution.

3. **Balance Scale Physics**:
   - **Challenge**: Creating a physically intuitive tilt direction for the balance scale that matches expectations.
   - **Solution**: I inverted the tilt direction calculation to ensure the heavier side tilts downward, implementing a cubic root function to enhance the visibility of small differences.

4. **State Reactivity**:
   - **Challenge**: Ensuring Vue components re-render when the state changes, especially with nested objects and arrays.
   - **Solution**: Used deep watching with Vue's watch API and designed the Pinia store to properly replace arrays instead of mutating them in place.

I'm particularly pleased with how the balance scale component turned out. The animation feels smooth and intuitive, providing clear feedback to users. The cubic scaling of the tilt angle makes even small differences in values noticeable, which is crucial for the educational aspect of the game.

The game state management using Pinia has proven to be a good decision, as it provides a clean separation between the UI and logic. This will make it easier to implement additional features and maintain the codebase going forward.

For Day 4, I plan to focus on refining the game flow and improving the user experience, especially for young learners who might need additional guidance and encouragement. 