# Blyss Design System

This document outlines the complete design system for **Blyss**, a barbershop and beauty salon booking application built as a Telegram Mini App. Use this guide to ensure any new designs (landing pages, marketing materials, etc.) are visually consistent with the existing app.

---

## Brand Identity

### App Name
**Blyss**

### App Description
A modern beauty salon and barbershop booking platform, primarily serving Uzbek-speaking users. The app allows users to discover salons, view services, book appointments, and communicate with stylists.

### Logo

The Blyss logo is an SVG-based wordmark featuring a **cyan-to-magenta gradient**.

**Logo Gradient Colors:**
- Start: `#00ddff` (Cyan)
- End: `#ff00d4` (Magenta)

**Logo Specifications:**
- Default size: 120×40px
- Large size (loading screen): 180×80px
- Horizontal orientation
- Clean, modern wordmark style

---

## Color Palette

### Primary / Accent Color (Orange)

The primary brand color is a vibrant orange, creating a warm and energetic feel.

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| Primary / Accent | `#f97316` | `#fb923c` |
| Primary Foreground | `#ffffff` | `#ffffff` |

**CSS Variables:**
```css
:root {
  --primary: #f97316;
  --accent: #f97316;
}
.dark {
  --primary: #fb923c;
  --accent: #fb923c;
}
```

### Neutral Colors (Stone Palette)

The app uses Tailwind's **Stone** gray palette for all neutral elements, giving a sophisticated, warm-tinted gray appearance.

| Usage | Light Mode | Dark Mode |
|-------|------------|-----------|
| Background | `white` / `#ffffff` | `stone-950` (very dark) |
| Card Background | `white` | `stone-800` |
| Primary Text | `stone-900` | `stone-100` |
| Secondary Text | `stone-500` / `gray-500` | `stone-400` |
| Muted Text | `stone-400` | `stone-500` |
| Borders | `stone-200` | `stone-700` / `stone-800` |
| Interactive Surfaces | `stone-100` | `stone-800` |
| Hover State | `stone-200` | `stone-700` |

### Semantic Colors

| Purpose | Color |
|---------|-------|
| Success / Online | `green-500` |
| Rating Stars | `yellow-500` / `yellow-400` |
| Favorite Heart | `#ed4c5c` (custom red) |
| Destructive / Error | `red-500` |

### Background CSS Variables (oklch format)

```css
:root {
  --background: oklch(1 0 0); /* white */
  --foreground: oklch(0.147 0.004 49.25); /* near black */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.147 0.004 49.25);
}

.dark {
  --background: oklch(0.147 0.004 49.25); /* very dark */
  --foreground: oklch(0.985 0.001 106.423); /* near white */
  --card: oklch(0.216 0.006 56.043);
  --card-foreground: oklch(0.985 0.001 106.423);
}
```

---

## Typography

### Font Family

**Inter** — A modern, highly legible sans-serif typeface from Google Fonts.

```css
font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
```

**Google Fonts Import:**
```
https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap
```

### Font Sizes

| Name | Size | Usage |
|------|------|-------|
| `text-xs` | 12px (0.75rem) | Labels, badges, metadata |
| `text-sm` | 14px (0.875rem) | Body text, descriptions |
| `text-base` | 16px (1rem) | Primary body text |
| `text-lg` | 18px (1.125rem) | Card titles |
| `text-xl` | 20px (1.25rem) | Section headers |
| `text-2xl` | 24px (1.5rem) | Page titles |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Regular body text |
| Medium | 500 | Most UI elements, navigation labels |
| Semibold | 600 | Emphasis, subheadings |
| Bold | 700 | Headings, strong emphasis |

---

## Icons

### Primary Icon Library

**Lucide React** — A clean, consistent icon set with rounded corners.

**Common Icons Used:**
- Navigation: `Home`, `Search`, `CalendarDays`, `MessageCircle`, `User`
- UI: `Star`, `ChevronRight`, `Check`, `CheckCheck`, `X`, `Clock`
- Location: `Navigation`, `MapPin`
- Actions: `CreditCard`

**Icon Sizes:**
- Navigation icons: 22px
- UI icons: 18-20px
- Small indicators: 16px

### Custom Service Icons

PNG icons for beauty/salon services located in `app/assets/icons/`:
- `haircut.png` — Haircut
- `beard.png` — Beard trim
- `manicure.png` — Manicure
- `pedicure.png` — Pedicure
- `facial.png` — Facial treatment
- `hair-dye.png` / `dye.png` — Hair coloring
- `spa.png` — Spa services
- `waxing.png` — Waxing
- `makeup.png` — Makeup
- `massage.png` — Massage
- `plucking.png` — Eyebrow plucking
- `cream.png` — Skincare
- `scissor.png` — General cutting
- `hand-mirror.png` — Mirror/styling
- `shaving-brush.png` — Shaving

### Custom SVG Icons

- **HeartIcon** — Favorites, with filled/outline states
- **MapPinIcon** — Location markers
- **StarIcon** — Ratings

---

## Spacing & Layout

### Border Radius

The app uses generous, rounded corners for a modern, friendly appearance.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 10px (0.625rem) | Base radius |
| `rounded-xl` | 12px (0.75rem) | Cards, containers |
| `rounded-2xl` | 16px (1rem) | Buttons, inputs, large cards |
| `rounded-3xl` | 24px (1.5rem) | Modals, bottom sheets |
| `rounded-[1.75rem]` | 28px | Bottom navigation bar |
| `rounded-full` | 9999px | Pills, badges, avatars |

### Common Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight spacing |
| `gap-2` | 8px | Between related elements |
| `gap-3` | 12px | Standard spacing |
| `p-2` | 8px | Small padding |
| `p-3` | 12px | Standard padding |
| `p-4` | 16px | Large padding |
| `px-3` / `px-4` | 12-16px | Horizontal padding |
| `py-3` | 12px | Vertical padding |
| `mb-6` / `mt-6` | 24px | Section margins |

### Container

- Max width: `max-w-lg` (512px)
- Centered: `mx-auto`
- Mobile-first responsive design

---

## Components

### UI Component Library

**HeroUI v3 (Beta)** — `@heroui/react` v3.0.0-beta.2

Components used:
- `Button` — Primary action buttons
- `Card` — Content containers
- `Avatar` — User profile images
- `Modal` — Dialogs and overlays
- `Chip` — Tags and status indicators
- `Skeleton` — Loading placeholders

### Button Styles

Primary buttons use the orange accent color with white text. They feature rounded corners (`rounded-2xl`) and press feedback (`active:scale-95`).

### Card Patterns

Cards typically feature:
- White background (dark: `stone-800`)
- Rounded corners (`rounded-xl` to `rounded-2xl`)
- Subtle shadows: `shadow-lg shadow-stone-200/50` (dark: `shadow-stone-950/50`)
- Padding: `p-3` to `p-4`

### Interactive Elements

**Pill Buttons** (used for filters, stats):
```css
bg-stone-100 dark:bg-stone-800
px-2 rounded-full
hover:bg-stone-200 dark:hover:bg-stone-700
transition-colors
```

**Press Feedback:**
```css
active:scale-95 transition-transform
```

---

## Visual Effects

### Shadows

```css
/* Standard card shadow */
shadow-lg shadow-stone-200/50
dark:shadow-stone-950/50

/* Elevated elements */
shadow-lg
```

### Backdrop Blur (Glassmorphism)

Used in navigation bars and overlays:
```css
backdrop-blur-md
backdrop-blur-lg
bg-white/95 dark:bg-stone-800/95
```

### Gradients

**Navigation fade effect:**
```css
background: linear-gradient(to top, white/95 0%, white/80 70%, transparent 100%);
```

### Transitions

```css
transition-colors /* Color changes */
transition-transform /* Scale/position changes */
transition-all /* All property changes */
duration-300 /* Standard duration */
ease-out /* Easing function */
```

---

## Dark Mode

### Implementation

- Uses CSS class `.dark` on `<html>` element
- Also supports `data-theme="dark"` attribute
- Respects `prefers-color-scheme: dark` media query

### Color Strategy

Dark mode doesn't use pure black. Instead, it uses warm-tinted dark grays from the Stone palette:
- Background: `stone-950` (almost black with warm undertone)
- Cards/Surfaces: `stone-800`
- Elevated surfaces: `stone-700`

### Pattern

All components use dual color classes:
```html
<div class="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
```

---

## Mobile & App Considerations

### Telegram Mini App Optimizations

- Full viewport expansion
- Safe area inset handling
- Disabled vertical swipe (prevents accidental app closure)
- Touch-optimized interactions

### Mobile-First Design

- No text selection (except inputs): `user-select: none`
- No tap highlight: `-webkit-tap-highlight-color: transparent`
- No callout on long press: `-webkit-touch-callout: none`
- Hidden scrollbars for horizontal scroll areas

### Loading States

**Loading Spinner:**
- Size: 32px (8 units)
- Border: 3px
- Color: Primary orange with transparent track
- Animation: `animate-spin`

**Navigation Progress Bar:**
- Height: 2px (0.5 units)
- Color: Primary orange
- Animation: Horizontal loading bar sweep

---

## Design Principles

1. **Mobile-First**: Designed primarily for mobile devices within Telegram
2. **Warm & Welcoming**: Orange accent with warm stone grays creates an approachable feel
3. **Modern & Clean**: Generous spacing, rounded corners, subtle shadows
4. **Card-Based Layout**: Content organized in distinct, rounded cards
5. **Smooth Interactions**: Animated transitions for state changes and navigation
6. **Accessibility**: Sufficient color contrast, clear typography hierarchy
7. **Dark Mode Ready**: Full dark mode support with carefully chosen colors

---

## Quick Reference

### Key Colors (Copy-Paste)

```
Primary Orange (Light): #f97316
Primary Orange (Dark): #fb923c
Logo Cyan: #00ddff
Logo Magenta: #ff00d4
Favorite Red: #ed4c5c
Star Yellow: #eab308 (yellow-500)
Success Green: #22c55e (green-500)
```

### Key Values

```
Font: Inter
Border Radius: 10-28px range
Max Container Width: 512px
Icon Size (Nav): 22px
Icon Size (UI): 18-20px
```
