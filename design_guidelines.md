# Design Guidelines: Excellent Place to Work Survey Platform

## Design Approach
**Selected Approach:** Design System - Material Design with enterprise focus  
**Rationale:** This is a professional certification survey platform requiring trust, security, and efficiency. The utility-focused nature (data collection for legal documentation) demands clarity, accessibility, and reliability over creative experimentation.

**Core Design Principles:**
- Trust & Professionalism: Visual design must convey credibility for legal documentation
- Effortless Progression: Minimize cognitive load across 50 questions
- Institutional Authority: Professional aesthetics that inspire confidence

---

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- **Dark Mode Primary:** 214 100% 65% (Professional blue - trust, stability)
- **Light Mode Primary:** 214 95% 50% (Deeper blue for contrast)
- **Company Brand:** Integrate Excellent Place to Work logo colors as accents

**Accent Colors:**
- **Success/Completion:** 142 76% 45% (Green for positive feedback)
- **Progress Indicator:** 214 100% 65% (Matches primary)
- **Warning/Required:** 25 95% 53% (Subtle orange, not alarming)

**Neutrals:**
- Dark mode backgrounds: 222 47% 11% (deep slate)
- Dark mode surfaces: 217 33% 17% (elevated cards)
- Dark mode text: 210 40% 98% (high contrast)
- Light mode backgrounds: 0 0% 98% (soft white)
- Light mode surfaces: 0 0% 100% (pure white cards)
- Light mode text: 222 47% 11% (readable gray-black)

### B. Typography

**Font Stack:**
- **Primary:** 'Inter' via Google Fonts - exceptional readability for survey questions
- **Headings:** 'Inter' 600-700 weight for clear hierarchy
- **Body:** 'Inter' 400-500 weight for comfortable reading

**Type Scale:**
- Survey Questions: text-lg (18px) for clarity
- Section Headings: text-2xl md:text-3xl (24-30px) 
- Page Titles: text-3xl md:text-4xl (30-36px)
- Response Options: text-base (16px) for easy scanning
- Helper Text: text-sm (14px) for supplementary info

### C. Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16
- Consistent vertical rhythm: py-8 between question groups
- Card padding: p-6 md:p-8 for breathing room
- Section margins: mb-12 for clear separation
- Button spacing: gap-4 for action groups

**Container Strategy:**
- Survey Container: max-w-3xl mx-auto (optimal reading width)
- Full-width Header/Footer: w-full with inner max-w-7xl
- Progress Bar: Fixed top with backdrop-blur
- Mobile: px-4, Desktop: px-6

### D. Component Library

**Authentication Flow:**
- Centered login card with company logo
- Email input with work domain validation indicator
- Clear security messaging ("Your responses are confidential")
- Loading states with subtle animations

**Survey Interface:**
- **Question Cards:** Elevated cards (shadow-lg) with rounded-2xl corners
- **Response Scale:** Horizontal button group for 5-point Likert scale
  - Radio button style with clear selected state
  - Visual hierarchy: Strongly Disagree (muted) → Strongly Agree (emphasized)
- **Progress Indicator:** 
  - Sticky header showing completion percentage
  - Section pills showing 5 sections with current highlight
  - Visual progress bar with smooth transitions

**Navigation:**
- Section-based navigation with "Next Section" / "Previous" buttons
- "Save & Continue Later" option (stores progress)
- Final "Submit Survey" with confirmation modal

**Data Display:**
- Section headers with question count (e.g., "Section A: Leadership & Vision (10 questions)")
- Clear numbering for all 50 questions
- Required field indicators subtle but clear

**Forms & Inputs:**
- Large touch targets (min 44px height) for mobile
- Clear focus states with ring-2 ring-primary
- Disabled state for unanswered requirements
- Error validation with helpful messaging

**Overlays:**
- Confirmation modal before submission
- Success page with completion summary
- Session timeout warnings

### E. Animations

**Minimal, Purposeful Motion:**
- Progress bar: smooth width transition (duration-500)
- Card reveals: fade-in on section change (duration-300)
- Button states: scale-95 on active for tactile feedback
- NO distracting scroll animations or parallax effects

---

## Page-Specific Guidelines

**Landing/Login Page:**
- Clean, centered authentication card
- Company logo prominently displayed
- Brief value proposition: "Secure Survey Platform for Workplace Certification"
- Trust indicators: "Responses stored securely for legal documentation"
- Minimal hero treatment - focus on login functionality

**Survey Experience:**
- One section visible at a time to reduce overwhelm
- Sticky progress header always visible
- Autosave functionality with visual confirmation
- Clear "Question X of 50" counter
- Section completion checkmarks

**Completion Page:**
- Success confirmation with company branding
- Survey completion ID for records
- Clear next steps messaging
- Return to dashboard option

---

## Accessibility & Responsive Design

- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all interactions
- Screen reader optimized labels for radio groups
- Dark mode toggle respecting system preferences
- Mobile: Stack responses vertically, Desktop: Horizontal scale
- Touch targets 44x44px minimum
- High contrast ratios (4.5:1 for text)

---

## Images

**Logo Placement:**
- Header: Company logo (Excellent Place to Work) - top left, 40-48px height
- Login page: Centered logo above authentication card, 64-80px height

**No Hero Image Required** - This is a utility application prioritizing function over visual storytelling. Clean, professional interface without decorative imagery.