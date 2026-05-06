# Sparkles – Design Specification

## 1. Product Vision

Sparkles is a calm, personal idea-capturing app that evolves raw thoughts into meaningful connections.

The experience should feel:
- Minimal and distraction-free
- Thoughtful and reflective
- Slightly magical (but not gimmicky)

The app should encourage users to:
- Capture ideas quickly
- Revisit and develop them
- Discover connections between ideas visually

---

## 2. Design Principles

1. **Calm First**
   - Avoid clutter
   - Use whitespace generously
   - No overwhelming UI elements

2. **Focus on Content**
   - Ideas are the hero
   - UI should fade into the background

3. **Progressive Disclosure**
   - Show only what is needed
   - Reveal complexity when user engages

4. **Subtle Delight**
   - Micro-interactions (glow, fade, soft motion)
   - Avoid loud animations

---

## 3. Core Screens

### 3.1 Inbox (Capture Screen)

Purpose:
Quickly capture ideas with minimal friction

UI:
- Large input field ("What's on your mind?")
- Primary CTA: Save
- Secondary: Record audio (icon button)

After saving:
- Modal:
  - "Develop further"
  - "Come back later"

Style:
- Clean, light background
- Soft shadows
- Rounded input field

---

### 3.2 Develop Screen

Purpose:
Expand and connect ideas

UI:
- Paper-like card layout
- Editable text area
- Section: "Related Ideas"
- Suggested links (AI-assisted)

Interactions:
- Tap to edit
- Tap to link ideas
- Remove link option

Style:
- Slight texture (paper feel)
- Warm neutral tones

---

### 3.3 Constellation View (Core Visual Identity)

Purpose:
Visualize idea relationships

Concept:
Ideas are stars in a night sky

UI:
- Dark background (deep navy or near-black)
- Ideas = glowing stars
- Links = thin glowing lines
- Subtle particle or twinkling effect

Interactions:
- Pan and zoom
- Tap star → open Develop screen
- Long press → highlight connections

Behavior:
- Clusters appear closer together
- Unconnected ideas float farther apart

Visual Style:
- Glow intensity varies slightly
- Smooth transitions (no sharp movement)
- Minimal labels unless selected

---

### 3.4 Cluster Results Screen

Triggered by:
"Cluster Ideas" button

Purpose:
Show grouped ideas clearly

UI:
- Card-based clusters
- Each cluster:
  - Title
  - List of ideas

Optional:
- Collapsible groups
- Subtle divider lines

Style:
- Light background
- Clear hierarchy
- Easy scanning

---

### 3.5 Settings / Backup

Purpose:
Control and data safety

UI:
- Simple list
- Buttons:
  - Backup Now
  - Restore from Drive
  - Enable AI Review

Style:
- Minimal
- Functional

---

## 4. Visual Design System

### Colors

Primary:
- Deep Navy / Space Black (Constellation view)

Secondary:
- Soft White / Off-white (Content screens)

Accent:
- Soft Glow Blue / Purple
- Muted Gold (optional highlight)

Avoid:
- Harsh neon colors
- High saturation

---

### Typography

- Clean sans-serif
- Medium weight for headings
- Regular for body
- Generous line spacing

---

### Spacing

- Use breathing space generously
- Avoid dense layouts
- Padding ≥ 16px standard

---

### Components

- Rounded cards (12–16px radius)
- Soft shadows (low opacity)
- Minimal borders

---

## 5. Motion & Interaction

- Use easing animations (slow in, slow out)
- Avoid abrupt transitions
- Star glow should pulse subtly
- Links fade in/out smoothly

---

## 6. AI Interaction UX

- AI actions should feel optional, not forced
- Use buttons like:
  - "Cluster Ideas"
  - "Review Ideas"

Feedback:
- Loading state: "Thinking..."
- Show results in structured format

---

## 7. Tone & Feel

The app should feel like:
- A personal notebook
- A thinking companion
- A quiet creative space

NOT:
- A productivity dashboard
- A social app
- A data-heavy tool

---

## 8. Accessibility

- Ensure readable contrast
- Avoid very dim text on dark backgrounds
- Provide clear tap targets

---

## 9. Future Enhancements (Design-ready)

- Timeline view of ideas
- Multi-device sync indicators
- Cluster visualization inside constellation

---

## 10. Summary

Sparkles blends:
- Minimal note-taking
- AI-assisted thinking
- Visual exploration

The experience should feel:
**simple at first, deep over time**

---

## 11. Navigation Architecture (Updated)

The app uses a minimal 3-tab navigation system to reduce cognitive load and maintain focus.

### Bottom Navigation Tabs

1. **Home (Constellation)**
   - Default landing screen
   - Visual exploration of ideas
   - Primary discovery interface

2. **Ideas**
   - Structured list view
   - Toggle between:
     - Flat list (chronological)
     - Clustered view (AI-organized)

3. **Settings**
   - Backup & Restore (Google Drive)
   - Account (Google identity)
   - AI preferences

---

## 12. Home = Constellation (Primary Experience)

The Constellation View is now the **main entry point** of the app.

### Purpose
- Encourage exploration over management
- Surface relationships between ideas naturally

---

### Visual Design Refinement

- Background:
  - Deep space gradient (`#000000` → `#0a0a1a`)
  - Subtle noise or grain for texture

- Stars (Ideas):
  - Small glowing nodes
  - Soft gold (`#ffd700`) with reduced intensity
  - Slight variation in size and brightness

- Faded Stars:
  - Represent older or less connected ideas
  - Lower opacity + smaller radius

- Links:
  - Thin glowing lines
  - Low opacity white (`rgba(255,255,255,0.2–0.3)`)
  - Smooth fade-in on interaction

---

### Interaction Model

- Tap star → open Develop screen
- Pan → move across constellation
- Pinch → zoom in/out
- Long press → highlight connected nodes

---

### Add Idea Entry Point (IMPORTANT)

A floating action button (FAB):

- Position: Bottom-right
- Style:
  - Circular
  - Amethyst (`#9b59b6`)
  - Soft shadow
- Icon: "+"
- Behavior:
  - Opens "Add New Idea" screen

---

## 13. Add New Idea Screen (New Primary Capture Flow)

This replaces inline capture as the main input method.

### Design Goals
- Calm
- Focused
- Zero distraction

---

### UI Structure

- Large centered text input
- Placeholder:
  "What’s on your mind?"

- Minimal controls:
  - Save (primary)
  - Record (icon)
  - Cancel / back

---

### Layout

- Generous padding (≥ 24px)
- Vertical breathing space
- No borders or heavy UI

---

### Visual Style

- Background: off-white (`#f9f9f9`)
- Input:
  - Borderless or subtle underline
- Typography:
  - Slightly larger body text (16–18px)

---

### Behavior

- Auto-focus on open
- Keyboard-first interaction
- Smooth transition back after save

---

## 14. Ideas Screen (List + Clusters)

### Purpose
Provide structured access to ideas

---

### Layout

Top section:
- Toggle switch:
  - "List"
  - "Clusters"

---

### List Mode

- Chronological order
- Card-based layout
- Preview text (2 lines)

---

### Cluster Mode

- Grouped cards
- Each cluster:
  - Title
  - Contained ideas

---

### Add Idea Button

- Secondary FAB OR top-right button
- Same behavior as Home FAB

---

## 15. Constellation Behavior Enhancements

To improve clarity and avoid visual noise:

### Node Density Handling

- Spread nodes with soft spacing rules
- Avoid tight overlaps

---

### Focus Mode (on selection)

When a node is selected:

- Increase brightness of:
  - Selected node
  - Connected nodes
- Fade all others

---

### Motion

- Stars subtly pulse (very low intensity)
- Links animate softly on creation
- Avoid constant movement (no distraction)

---

## 16. Visual Tone Adjustment

### Goal:
Make constellation feel:

- Calm
- Expansive
- Slightly mysterious

---

### Avoid:

- Neon/glow overload
- Game-like visuals
- High-contrast flickering

---

### Prefer:

- Soft glow
- Low contrast depth
- Gentle gradients

---

## 17. UX Flow Summary (Updated)

1. User opens app → lands on Constellation
2. Sees idea landscape (visual memory)
3. Taps "+" → captures idea
4. Returns → idea appears as new star
5. Uses "Ideas" tab for structured editing
6. Uses "Cluster Ideas" for organization

---

## 18. Design Intent (Refined)

Sparkles is no longer just a capture tool.

It is:

> A **thinking space** where ideas evolve from sparks into constellations.

The UI should support:
- Fast capture
- Slow exploration
- Meaningful connection
