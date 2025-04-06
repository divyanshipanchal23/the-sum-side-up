# Balance Scale Addition Game - Schema Design

This document outlines the data models, database schema, and API contracts for the Balance Scale Addition Game. The schema design aligns with the specified technology stack (Vue.js, FastAPI, Firebase Authentication, and Firestore) and meets the requirements detailed in the project documentation.

## Data Models

### 1. User Model

```typescript
// Frontend TypeScript model
interface User {
  id: string;                  // Firebase Auth UID
  email: string;               // User's email address
  displayName: string;         // User's display name
  role: 'student' | 'educator' | 'admin';  // User role for permissions
  createdAt: Timestamp;        // Account creation timestamp
  lastLogin: Timestamp;        // Last login timestamp
  linkedEducators?: string[];  // Array of educator IDs (for students only)
  linkedStudents?: string[];   // Array of student IDs (for educators only)
  settings: {                  // User preferences
    theme: string;             // UI theme preference
    soundEnabled: boolean;     // Sound effect toggle
    accessibilityOptions: {    // Accessibility settings
      highContrast: boolean;
      largeText: boolean;
      reducedMotion: boolean;
    }
  }
  isIndependentStudent?: boolean;  // Flag for students not linked to an educator
}
```

```python
# Backend Pydantic model
class UserBase(BaseModel):
    email: str
    display_name: str
    role: Literal['student', 'educator', 'admin']
    
class UserCreate(UserBase):
    password: str
    link_to_educator: Optional[str] = None  # Educator code or email to link with

class UserInDB(UserBase):
    id: str
    created_at: datetime
    last_login: Optional[datetime] = None
    linked_educators: List[str] = []  # For students
    linked_students: List[str] = []   # For educators
    is_independent_student: bool = False
    settings: Dict[str, Any] = {}
    
    class Config:
        orm_mode = True
```

### 2. Game Configuration Model

```typescript
// Frontend TypeScript model
interface GameConfiguration {
  id: string;                  // Unique configuration ID
  title: string;               // Configuration name
  description: string;         // Description of the configuration
  createdBy: string;           // Creator's user ID
  createdAt: Timestamp;        // Creation timestamp
  updatedAt: Timestamp;        // Last update timestamp
  isPublic: boolean;           // Whether config can be used by others
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetRange: {               // Range for target numbers
    min: number;
    max: number;
  };
  numberOfAddends: number;     // How many numbers to add together
  timeLimit: number | null;    // Time limit in seconds (null = no limit)
  hintsEnabled: boolean;       // Whether hints are available
  progressionRules: {          // Rules for advancing difficulty
    requiredSuccessRate: number;  // Required percentage of correct answers
    advancementThreshold: number; // Number of problems before advancing
  };
  visualSettings: {            // Visual customization
    theme: string;             // Visual theme
    animations: 'minimal' | 'standard' | 'enhanced';
  };
  forIndependentStudents?: boolean; // Whether this is a default configuration for students without educators
}
```

```python
# Backend Pydantic model
class TargetRange(BaseModel):
    min: int
    max: int

class ProgressionRules(BaseModel):
    required_success_rate: float
    advancement_threshold: int

class VisualSettings(BaseModel):
    theme: str = "default"
    animations: Literal['minimal', 'standard', 'enhanced'] = "standard"

class GameConfigurationBase(BaseModel):
    title: str
    description: str = ""
    difficulty: Literal['beginner', 'intermediate', 'advanced']
    target_range: TargetRange
    number_of_addends: int
    time_limit: Optional[int] = None
    hints_enabled: bool = True
    progression_rules: ProgressionRules
    visual_settings: VisualSettings = VisualSettings()
    is_public: bool = False
    for_independent_students: bool = False

class GameConfigurationCreate(GameConfigurationBase):
    pass

class GameConfigurationInDB(GameConfigurationBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
```

### 3. Game Session Model

```typescript
// Frontend TypeScript model
interface GameSession {
  id: string;                  // Unique session ID
  userId: string;              // User playing the game
  configId: string;            // Game configuration ID
  startedAt: Timestamp;        // Session start time
  completedAt: Timestamp | null; // Session end time (null if in progress)
  currentLevel: number;        // Current difficulty level
  correctAnswers: number;      // Count of correct answers
  totalAttempts: number;       // Count of total attempts
  rounds: GameRound[];         // Individual rounds within the session
}

interface GameRound {
  roundNumber: number;         // Sequence number within session
  targetNumber: number;        // Number to match
  addends: number[];           // Numbers input by the user
  isCorrect: boolean;          // Whether the sum equals the target
  timeTaken: number;           // Time taken in seconds
  hintsUsed: number;           // Number of hints used
  timestamp: Timestamp;        // When this round was played
}
```

```python
# Backend Pydantic model
class GameRound(BaseModel):
    round_number: int
    target_number: int
    addends: List[int]
    is_correct: bool
    time_taken: float
    hints_used: int
    timestamp: datetime

class GameSessionBase(BaseModel):
    user_id: str
    config_id: str
    current_level: int = 1
    correct_answers: int = 0
    total_attempts: int = 0
    
class GameSessionCreate(GameSessionBase):
    pass

class GameSessionInDB(GameSessionBase):
    id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    rounds: List[GameRound] = []
    
    class Config:
        orm_mode = True
```

### 4. Progress Tracking Model

```typescript
// Frontend TypeScript model
interface UserProgress {
  userId: string;              // User ID
  totalSessions: number;       // Total number of game sessions
  totalCorrect: number;        // Total correct answers
  totalAttempts: number;       // Total attempts
  averageResponseTime: number; // Average time to answer in seconds
  skillLevels: {              // Progress in different skill areas
    [skillName: string]: {
      level: number;           // Current skill level
      mastery: number;         // Mastery percentage (0-100)
      lastPracticed: Timestamp; // When last practiced
    }
  };
  achievements: {             // Unlocked achievements
    id: string;               // Achievement ID
    name: string;             // Achievement name
    unlockedAt: Timestamp;    // When it was unlocked
  }[];
  recentActivity: {           // Recent game sessions
    sessionId: string;        // Session ID
    configId: string;         // Configuration ID
    date: Timestamp;          // Session date
    score: number;            // Score achieved
    duration: number;         // Session duration in minutes
  }[];
}
```

```python
# Backend Pydantic model
class SkillLevel(BaseModel):
    level: int
    mastery: float  # 0-100
    last_practiced: datetime

class Achievement(BaseModel):
    id: str
    name: str
    unlocked_at: datetime

class RecentActivity(BaseModel):
    session_id: str
    config_id: str
    date: datetime
    score: int
    duration: float  # in minutes

class UserProgressBase(BaseModel):
    user_id: str
    total_sessions: int = 0
    total_correct: int = 0
    total_attempts: int = 0
    average_response_time: float = 0
    
class UserProgressInDB(UserProgressBase):
    skill_levels: Dict[str, SkillLevel] = {}
    achievements: List[Achievement] = []
    recent_activity: List[RecentActivity] = []
    
    class Config:
        orm_mode = True
```

### 5. Educator-Student Link Request Model

```typescript
// Frontend TypeScript model
interface LinkRequest {
  id: string;                   // Unique request ID
  studentId: string;            // Student user ID
  educatorId: string;           // Educator user ID
  studentName: string;          // Student display name
  educatorName: string;         // Educator display name
  requestedAt: Timestamp;       // When the request was created
  status: 'pending' | 'approved' | 'rejected'; // Request status
  resolvedAt: Timestamp | null; // When the request was resolved
  message?: string;             // Optional message from student
}
```

```python
# Backend Pydantic model
class LinkRequestBase(BaseModel):
    student_id: str
    educator_id: str
    message: Optional[str] = None
    
class LinkRequestCreate(LinkRequestBase):
    pass

class LinkRequestInDB(LinkRequestBase):
    id: str
    student_name: str
    educator_name: str
    requested_at: datetime
    status: Literal['pending', 'approved', 'rejected'] = 'pending'
    resolved_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
```

## Firestore Database Schema

### Collections and Documents Structure

```
users/
  {user_id}/
    role: string
    displayName: string
    email: string
    createdAt: timestamp
    lastLogin: timestamp
    linkedEducators: array (for students)
    linkedStudents: array (for educators)
    isIndependentStudent: boolean
    settings: map

game_configurations/
  {config_id}/
    title: string
    description: string
    createdBy: string (user_id)
    createdAt: timestamp
    updatedAt: timestamp
    isPublic: boolean
    difficulty: string
    targetRange: map
    numberOfAddends: number
    timeLimit: number|null
    hintsEnabled: boolean
    progressionRules: map
    visualSettings: map
    forIndependentStudents: boolean

game_sessions/
  {session_id}/
    userId: string
    configId: string
    startedAt: timestamp
    completedAt: timestamp|null
    currentLevel: number
    correctAnswers: number
    totalAttempts: number
    rounds: array

user_progress/
  {user_id}/
    totalSessions: number
    totalCorrect: number
    totalAttempts: number
    averageResponseTime: number
    skillLevels: map
    achievements: array
    recentActivity: array

link_requests/
  {request_id}/
    studentId: string
    educatorId: string
    studentName: string
    educatorName: string
    requestedAt: timestamp
    status: string
    resolvedAt: timestamp|null
    message: string

assignments/
  {assignment_id}/
    createdBy: string (educator user_id)
    assignedTo: array (student user_ids)
    configId: string
    dueDate: timestamp
    status: string
    instructions: string
```

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authentication check
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Role checks
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isEducator() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'educator';
    }
    
    function isStudent() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    // Check if student is linked to educator
    function isLinkedToEducator(studentId, educatorId) {
      return get(/databases/$(database)/documents/users/$(studentId)).data.linkedEducators.hasAny([educatorId]);
    }
    
    // User can only read/write their own data
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }
    
    // Game configuration rules
    match /game_configurations/{configId} {
      allow read: if isAuthenticated() && (resource.data.isPublic == true || 
                                          resource.data.createdBy == request.auth.uid || 
                                          resource.data.forIndependentStudents == true ||
                                          isAdmin());
      allow create: if isAuthenticated() && (isEducator() || isAdmin());
      allow update, delete: if isAuthenticated() && (resource.data.createdBy == request.auth.uid || 
                                                   isAdmin());
    }
    
    // Game session rules
    match /game_sessions/{sessionId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || 
                                         isAdmin() || 
                                         (isEducator() && getAssignmentAccess(resource.data.configId, request.auth.uid)));
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }
    
    // User progress rules
    match /user_progress/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || 
                                         isAdmin() || 
                                         (isEducator() && isLinkedToEducator(userId, request.auth.uid)));
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }
    
    // Link request rules
    match /link_requests/{requestId} {
      allow read: if isAuthenticated() && (
        resource.data.studentId == request.auth.uid || 
        resource.data.educatorId == request.auth.uid || 
        isAdmin()
      );
      allow create: if isAuthenticated() && isStudent();
      allow update: if isAuthenticated() && (
        resource.data.educatorId == request.auth.uid ||
        isAdmin()
      );
    }
    
    // Assignment rules
    match /assignments/{assignmentId} {
      allow read: if isAuthenticated() && (resource.data.createdBy == request.auth.uid || 
                                         isAdmin() || 
                                         resource.data.assignedTo.hasAny([request.auth.uid]));
      allow create, update, delete: if isAuthenticated() && (isEducator() || isAdmin());
    }
    
    // Helper functions
    function getAssignmentAccess(configId, educatorId) {
      return exists(/databases/$(database)/documents/assignments/
        where('configId', '==', configId).where('createdBy', '==', educatorId));
    }
    
    function getStudentAccess(studentId, educatorId) {
      return exists(/databases/$(database)/documents/assignments/
        where('assignedTo', 'array-contains', studentId).where('createdBy', '==', educatorId));
    }
  }
}
```

## API Contracts

### Authentication API

#### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe",
  "role": "student",
  "linkToEducator": "educator@school.edu"  // Optional
}
```

**Response:**
```json
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "student",
    "isIndependentStudent": false,
    "createdAt": "2023-02-10T12:00:00Z"
  },
  "linkRequestCreated": true,  // If linkToEducator was provided
  "token": "jwt-token-here"
}
```

#### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "student",
    "isIndependentStudent": false,
    "linkedEducators": ["educator456"],
    "lastLogin": "2023-02-10T15:30:00Z"
  },
  "token": "jwt-token-here"
}
```

### Educator-Student Linking API

#### 1. Create Link Request

**Endpoint:** `POST /api/link-requests`

**Request:**
```json
{
  "educatorId": "educator456",
  "message": "I'm from Ms. Smith's 3rd grade class"
}
```

**Response:**
```json
{
  "id": "request789",
  "studentId": "student123",
  "educatorId": "educator456",
  "studentName": "John Doe", 
  "educatorName": "Jane Smith",
  "requestedAt": "2023-02-10T14:00:00Z",
  "status": "pending"
}
```

#### 2. Get Pending Link Requests (for Educators)

**Endpoint:** `GET /api/educators/{educatorId}/link-requests`

**Response:**
```json
{
  "requests": [
    {
      "id": "request789",
      "studentId": "student123",
      "studentName": "John Doe",
      "requestedAt": "2023-02-10T14:00:00Z",
      "message": "I'm from Ms. Smith's 3rd grade class"
    }
  ]
}
```

#### 3. Resolve Link Request

**Endpoint:** `PUT /api/link-requests/{requestId}`

**Request:**
```json
{
  "status": "approved"  // or "rejected"
}
```

**Response:**
```json
{
  "id": "request789",
  "studentId": "student123",
  "educatorId": "educator456",
  "studentName": "John Doe",
  "educatorName": "Jane Smith",
  "requestedAt": "2023-02-10T14:00:00Z",
  "status": "approved",
  "resolvedAt": "2023-02-10T16:00:00Z"
}
```

### Game Configuration API

#### 1. Create Game Configuration

**Endpoint:** `POST /api/configurations`

**Request:**
```json
{
  "title": "Basic Addition Level 1",
  "description": "Simple addition with numbers 1-10",
  "difficulty": "beginner",
  "targetRange": {
    "min": 1,
    "max": 10
  },
  "numberOfAddends": 2,
  "timeLimit": null,
  "hintsEnabled": true,
  "progressionRules": {
    "requiredSuccessRate": 80,
    "advancementThreshold": 10
  },
  "isPublic": true,
  "forIndependentStudents": false
}
```

**Response:**
```json
{
  "id": "config123",
  "title": "Basic Addition Level 1",
  "description": "Simple addition with numbers 1-10",
  "createdBy": "user123",
  "createdAt": "2023-02-10T16:00:00Z",
  "updatedAt": "2023-02-10T16:00:00Z",
  "difficulty": "beginner",
  "targetRange": {
    "min": 1,
    "max": 10
  },
  "numberOfAddends": 2,
  "timeLimit": null,
  "hintsEnabled": true,
  "progressionRules": {
    "requiredSuccessRate": 80,
    "advancementThreshold": 10
  },
  "isPublic": true,
  "forIndependentStudents": false,
  "visualSettings": {
    "theme": "default",
    "animations": "standard"
  }
}
```

#### 2. Get Game Configurations

**Endpoint:** `GET /api/configurations?difficulty=beginner&limit=10`

**Response:**
```json
{
  "configurations": [
    {
      "id": "config123",
      "title": "Basic Addition Level 1",
      "description": "Simple addition with numbers 1-10",
      "createdBy": "user123",
      "createdAt": "2023-02-10T16:00:00Z",
      "difficulty": "beginner",
      "targetRange": {
        "min": 1,
        "max": 10
      },
      "numberOfAddends": 2,
      "isPublic": true,
      "forIndependentStudents": false
    },
    // additional configurations...
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### Game Session API

#### 1. Start Game Session

**Endpoint:** `POST /api/sessions`

**Request:**
```json
{
  "configId": "config123"
}
```

**Response:**
```json
{
  "id": "session456",
  "userId": "user123",
  "configId": "config123",
  "startedAt": "2023-02-10T17:00:00Z",
  "currentLevel": 1,
  "config": {
    "title": "Basic Addition Level 1",
    "targetRange": {
      "min": 1,
      "max": 10
    },
    "numberOfAddends": 2,
    "timeLimit": null,
    "hintsEnabled": true
  },
  "currentRound": {
    "roundNumber": 1,
    "targetNumber": 7
  }
}
```

#### 2. Submit Answer

**Endpoint:** `POST /api/sessions/{sessionId}/rounds`

**Request:**
```json
{
  "addends": [3, 4],
  "timeTaken": 5.2,
  "hintsUsed": 0
}
```

**Response:**
```json
{
  "isCorrect": true,
  "feedback": {
    "message": "Great job!",
    "balanceState": "balanced",
    "animation": "celebration"
  },
  "stats": {
    "correctAnswers": 1,
    "totalAttempts": 1,
    "averageTime": 5.2
  },
  "nextRound": {
    "roundNumber": 2,
    "targetNumber": 12
  }
}
```

### User Progress API

#### 1. Get User Progress

**Endpoint:** `GET /api/users/{userId}/progress`

**Response:**
```json
{
  "userId": "user123",
  "totalSessions": 5,
  "totalCorrect": 42,
  "totalAttempts": 50,
  "averageResponseTime": 4.8,
  "skillLevels": {
    "basicAddition": {
      "level": 3,
      "mastery": 84,
      "lastPracticed": "2023-02-10T18:30:00Z"
    }
  },
  "recentActivity": [
    {
      "sessionId": "session456",
      "configId": "config123",
      "date": "2023-02-10T17:00:00Z",
      "score": 9,
      "duration": 8.5
    }
  ],
  "achievements": [
    {
      "id": "achievement789",
      "name": "Quick Thinker",
      "unlockedAt": "2023-02-10T17:30:00Z"
    }
  ]
}
```

#### 2. Get Educator Dashboard Data

**Endpoint:** `GET /api/educators/{educatorId}/dashboard`

**Response:**
```json
{
  "studentCount": 25,
  "activeStudents": 18,
  "assignmentCompletionRate": 72,
  "pendingLinkRequests": 3,
  "topConfigurations": [
    {
      "id": "config123",
      "title": "Basic Addition Level 1",
      "usageCount": 120,
      "averageSuccessRate": 85
    }
  ],
  "studentProgress": [
    {
      "userId": "student456",
      "displayName": "Jane Smith",
      "overallProgress": 68,
      "recentActivity": "2023-02-10T16:45:00Z",
      "flaggedAreas": ["multi-digit addition"]
    }
  ]
}
```

## Schema Evolution Strategy

The schema is designed to support future expansion while maintaining backward compatibility. To manage schema evolution:

1. **Versioning**: API endpoints may include version numbers (e.g., `/api/v1/configurations`) to support multiple schema versions.

2. **Optional Fields**: Models include optional fields with sensible defaults to ensure backward compatibility.

3. **Extensible Enums**: Enumerations (like difficulty levels) can be extended with new values without breaking existing functionality.

4. **Firestore Flexibility**: Firestore's schema-less nature allows for gradual field additions without migration requirements.

5. **Deprecation Policy**: Fields or endpoints marked for deprecation will remain functional for at least two release cycles before removal.

This schema design provides a comprehensive foundation for the Balance Scale Addition Game, supporting the educational goals while maintaining flexibility for future enhancements. 