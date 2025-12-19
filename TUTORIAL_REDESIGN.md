# Tutorial Redesign Plan

## Current Issues
1. Tutorial doesn't navigate between pages
2. No achievements page walkthrough
3. No settings/accessibility explanation
4. Tutorial window covers elements it's highlighting
5. No separate manual tutorial flow
6. Wrong sequence

## Proposed Solution

### Tutorial Flows

**1. firstTime (Auto-start for new users)**
- Language selection (4 steps)
- Home page overview
- **Navigate to /achievements** - Explain badges
- **Navigate to /settings** - Explain accessibility options
- **Navigate to /home** - Return home
- Guide to Play button → chains to gameSetup

**2. tour (Manual, triggered by ? button)**
- Skip language intro
- Start from current page
- **Navigate through all main pages**:
  - /home - Overview
  - /achievements - Badges
  - /settings - Accessibility
  - /learn - Language info
  - /home - Back to home
- Optional: Guide to Play

**3. gameSetup (Triggered after Play)**
- Explain practice modes
- Explain goal setting
- Wait for Start button

### Implementation Steps

1. Add `useNavigate` to TutorialContext
2. Add `navigateTo` field to tutorial steps
3. Update step handling to navigate when needed
4. Create tour tutorial definition
5. Update firstTime to include navigation
6. Fix ? button to start 'tour' instead of 'firstTime'

### Step Structure
```javascript
{
  id: 'step-id',
  title: 'Step Title',
  description: 'Description',
  icon: '🎯',
  targetSelector: '.element-class',
  navigateTo: '/path', // Optional - navigate before showing this step
  waitForAction: 'click' // Optional - wait for user interaction
}
```
