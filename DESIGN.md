---
name: Pebble
description: The personal room where your tasks, money, and goals live together.
colors:
  cream-pop: "#9A6428"
  cream-pop-light: "#FFF0D8"
  cream-pop-mid: "#E8BE78"
  cream-pop-muted: "#D4A048"
  cream-pop-deep: "#5E3A10"
  cream-border: "#F0D8B0"
  cream-surface: "#FFF9F2"
  sky-float: "#B4D4F0"
  sky-float-light: "#EFF8FF"
  peach-fizz: "#F5C4A8"
  peach-fizz-deep: "#EDA882"
  peach-fizz-light: "#FFE0CC"
  peach-fizz-text: "#B84A20"
  mint-lift: "#8ADAB5"
  mint-lift-deep: "#5CC090"
  mint-lift-light: "#D4F5E5"
  mint-lift-text: "#1D7A4A"
  canvas: "#FFF8EE"
  canvas-dark: "#F5ECD8"
  room-card: "#FFFFFF"
  room-text: "#3A200A"
  room-muted: "#7A5838"
  room-subtle: "#B09070"
typography:
  display:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.3
  headline:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1.4
  title:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.6
  label:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.04em"
  nano:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.02em"
rounded:
  xs: "3px"
  sm: "10px"
  nav: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  full: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "40px"
components:
  room-card:
    backgroundColor: "{colors.room-card}"
    textColor: "{colors.room-text}"
    rounded: "{rounded.md}"
    padding: "20px"
  room-card-hover:
    backgroundColor: "{colors.room-card}"
    textColor: "{colors.room-text}"
  button-primary:
    backgroundColor: "{colors.cream-pop}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.cream-pop-deep}"
    textColor: "#FFFFFF"
  fab:
    backgroundColor: "{colors.cream-pop}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    size: "56px"
  nav-item:
    textColor: "{colors.room-muted}"
    rounded: "12px"
    padding: "10px 14px"
  nav-item-active:
    backgroundColor: "{colors.cream-pop}"
    textColor: "#FFFFFF"
  badge:
    backgroundColor: "{colors.cream-pop-light}"
    textColor: "{colors.cream-pop-deep}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: Pebble

## Overview

**Creative North Star: "The Pixel Cottage"**

Pebble is a cozy, hand-decorated digital room — the Cyworld Minihompy for your daily life. The interface feels like a personal space the user actually inhabits: warm cream walls, patterned wallpaper they chose, furniture (cards) arranged by need. Nothing is clinical or demanding. Everything is warm, rounded, and quietly cheerful.

The palette is built around warm cream as the dominant identity — honey amber for primary actions, golden tones for accents and borders, with sky, peach, and mint as supporting module colors. There are no hard blacks, no aggressive gradients, no stark neutrals. The surface feels like warm parchment, not glass. Pixel-art SVG decorations (a small cat, flowers, stars) anchor the personality without tipping into childishness.

The design rejects the productivity-app default of aggressive whites, red alerts, and corporate hierarchy. This is calm, encouraging, and personal. It earns trust through gentleness, not authority.

**Key Characteristics:**
- Rounded everywhere — `16px` default, never sharp
- Warm amber shadows instead of grey
- Pixel-art SVG decorations as personality anchors (`crispEdges`, 16×24px grids)
- User-selectable tileable wallpaper patterns as the room's identity layer
- Single-typeface system (Nunito 600–900) — weight is the only differentiator
- All UI copy in Bahasa Indonesia, calm and encouraging tone
- Each product module owns one accent color (Queue → Cream/Honey, Finance → Peach/Sky, Goals → Mint)

## Colors

A four-accent system on a warm cream canvas. Every neutral carries warm amber undertones — there is no neutral grey in this system.

### Primary — Cream Warmth
- **Cream Pop** (`#9A6428`): Primary action color. Buttons, active nav, FAB, progress fill gradient, active tabs. The room's signature warm honey amber hue. WCAG AA compliant with white text (4.95:1).
- **Cream Pop Light** (`#FFF0D8`): Hover backgrounds, badge fills, tab strip background, input focus fill.
- **Cream Pop Deep** (`#5E3A10`): Text on light cream surfaces; pressed/active label text.
- **Cream Border** (`#F0D8B0`): All card borders, input outlines, dividers. Warm amber-tinted — never grey.

### Secondary — Sky Float
- **Sky Float** (`#B4D4F0`): Finance module accent. Transaction indicators, balance card background tones.
- **Sky Float Light** (`#EFF8FF`): Finance section fills, cloud wallpaper base.

### Tertiary Accents
- **Peach Fizz** (`#F5C4A8`): Finance warnings, over-budget state, expense row emphasis.
- **Peach Fizz Deep** (`#EDA882`): Pressed peach state, priority-high badge border, income/expense icons.
- **Mint Lift** (`#8ADAB5`): Goal progress, done task indicators, habit check marks, success feedback.
- **Mint Lift Deep** (`#5CC090`): Pressed mint state, active goal accents.

### Neutral
- **Canvas** (`#FFF8EE`): Page background and wallpaper-plain base. Never pure white. Warmer than the old cream.
- **Canvas Dark** (`#F5ECD8`): Alternate zone backgrounds, secondary section fills.
- **Room Card** (`#FFFFFF`): Card surface — slightly cooler than the canvas ground; the contrast defines the "furniture on floor" illusion.
- **Room Text** (`#3A200A`): Primary text. Deep warm espresso, not black. Use everywhere body text appears.
- **Room Muted** (`#7A5838`): Navigation idle state, secondary labels, metadata, helper text.
- **Room Subtle** (`#B09070`): Placeholder text, strikethrough / done-task text, disabled states only.

### Named Rules
**The No-Grey Rule.** This system has no grey. Every neutral is warm amber-tinted. `#7A5838` replaces cold muted greys; `#B09070` replaces neutral disabled greys. If a shadow or neutral reads as cold, push the amber back in.

**The Domain-Color Rule.** Queue = Cream/Honey. Finance = Peach + Sky. Goals = Mint. Widget headers, progress fills, and accent chips follow this mapping consistently. Crossing domains (a mint-colored task badge) signals to the user that something doesn't belong.

## Typography

**Single Font:** Nunito (Google Fonts, weights 400–900, `ui-rounded` system fallback)

**Character:** One warm, rounded sans-serif family carrying every text role. The rounded terminals reinforce the cottage softness. Weight is the sole differentiator — no second font, no mono accent, no serif. At 800 (extrabold) Nunito is assertive for headings; at 600 (semibold) it is calm for body copy.

### Hierarchy
- **Display** (800, `1.25rem`, lh `1.3`): Page `h1` titles, room header greeting. Bahasa Indonesia, sentence case, no uppercase.
- **Headline** (800, `1rem`, lh `1.4`): Widget and card titles, modal headings.
- **Title** (700, `0.9375rem`, lh `1.5`): Navigation labels, task card titles, transaction notes.
- **Body** (600, `0.875rem`, lh `1.6`): Goal descriptions, task detail, form helper text. Max line length 65ch.
- **Label** (700, `0.6875rem`, tracking `+0.04em`, uppercase): Stat chip labels, category overlines, "TUGAS AKTIF" kickers. Always uppercase and tracked.
- **Caption** (600, `0.6875rem`, lh `1.4`): Timestamps, sub-task counts, secondary metadata.

### Named Rules
**The No-Thin Rule.** Minimum rendered weight is 600 (semibold). Nunito at 400 at small sizes loses its roundedness and reads as generic. When a text role feels weak, go heavier — not larger.

## Layout

**Mobile-first single-column.** All content stacks in a `max-w-2xl mx-auto` column with `px-4` gutters and `pb-24` bottom clearance for the bottom navigation bar.

**Desktop: sidebar + canvas.** A `240px` sticky sidebar (`hidden lg:flex`) carries room identity, navigation, and pixel decorations. The main canvas fills the remaining width with `lg:px-8` and no max-width constraint at desktop breakpoints.

**Widget grid:** Single-column `grid gap-4` on mobile. At `lg:` breakpoints, consumer layouts may expand to `grid-cols-2` or `grid-cols-3` for the overview room.

**Spacing scale in practice:**
- `8px` — inside badges, icon-to-label gap
- `12px` — between list items within a widget
- `20px` — card internal padding, between widgets
- `28px` — between major sections
- `40px` — page top clearance

**Bottom nav clearance:** The bottom navigation bar (`h-16`, `position: fixed`) requires `pb-24` on all mobile page containers.

## Elevation & Depth

**Hybrid model — flat at rest, lifted on interaction.** Cards sit on the wallpapered room floor at a resting shadow. On hover/focus they rise subtly. There are no decorative box shadows on non-interactive elements.

**All shadows use `rgba(154,100,40,…)`.** This is the cream-pop hue at low opacity. It reads as warmth. Grey shadows (`rgba(0,0,0,…)`) are foreign to this system.

### Shadow Vocabulary
- **Room card resting** (`0 4px 16px rgba(154,100,40,0.12)`): Default for all `room-card` containers. Structural, not decorative.
- **Room card hover** (`0 8px 24px rgba(154,100,40,0.20)`): Paired with `translateY(-1px)`. Indicates the card is interactive.
- **FAB** (`0 4px 16px rgba(154,100,40,0.40)`): Heavier to separate the floating button from all card surfaces.
- **Active nav item** (`0 2px 8px rgba(154,100,40,0.25)`): Sidebar and bottom-nav active state.

### Named Rules
**The Amber Shadow Rule.** Every `box-shadow` in this system uses `rgba(154,100,40,…)` as its color. Any grey shadow is a defect, not a design choice.

**The State-Driven Rule.** Shadows appear as a response to state (hover, active, elevation from FAB). Resting shadows communicate "this is a touchable furniture piece." Non-interactive text blocks and dividers carry no shadow.

## Shapes

**Rounded by principle.** The radius scale runs from `10px` to `32px` with a pill (`999px`) for inline elements. Sharp corners (`0px`) do not appear on any visible bordered surface.

| Token | Value | Used on |
|---|---|---|
| `sm` | `10px` | Small icon containers, badge inner, scrollbar thumb |
| `md` | `16px` | Room cards — the default container unit |
| `lg` | `24px` | Room header, large info banners |
| `xl` | `32px` | Modal sheets (future) |
| `full` | `999px` | Pills: tabs, chips, FAB, progress track |

**Border weight:** `2px solid {colors.cream-border}` on all cards. Never `1px` on cards — it vanishes against the canvas background on high-DPI screens.

**Pixel-art decorations are the deliberate exception.** Inline SVG pixel icons (`shapeRendering: crispEdges`) live on a 16×16 or 24×24 pixel grid. They are intentionally non-smooth, coexisting with the rounded UI in deliberate contrast. Do not apply `border-radius` to pixel-art assets.

## Components

### Room Card
The primary container unit — a furniture piece in the room.
- **Shape:** `16px` radius, `2px solid #F0D8B0`
- **Surface:** `#FFFFFF` on canvas/wallpaper ground
- **Padding:** `20px` uniform
- **Elevation:** resting shadow `0 4px 16px rgba(154,100,40,0.12)`; hover lifts +1px and deepens shadow
- **Header anatomy:** `36×36px` accent icon container (`rounded-xl`) + `extrabold 0.875rem` title + optional right-side badge or action icon

### Navigation — Sidebar (desktop)
- **Width:** `240px` fixed, sticky, full-height
- **Item idle:** text `#7A5838`, transparent bg, `12px` radius, `10px 14px` padding
- **Item hover:** bg `#FFF0D8`, text `#5E3A10`
- **Item active:** bg `#9A6428`, text white, shadow `0 2px 8px rgba(154,100,40,0.25)`
- **Decoration footer:** pixel-art flowers at reduced opacity

### Navigation — Bottom Bar (mobile)
- **Height:** `64px`, `position: fixed, bottom: 0`, `z-index: 40`
- **Icon container:** `36×36px` `rounded-2xl`; active fills with `#9A6428`
- **Label:** `10px` bold; active `#7C4E18`, idle `#B09070`
- **Requires:** `pb-24` on all mobile content containers

### Buttons — FAB
- **Size:** `56px` circle
- **Surface:** linear gradient `135deg` from `#9A6428` to `#D4A048`
- **Shadow:** `0 4px 16px rgba(154,100,40,0.40)`
- **Hover:** `scale(1.08)` + deeper shadow; active: `scale(0.95)`
- **Icon:** `Lucide <Plus>` at `26px`, `strokeWidth 3`

### Priority Badges
Warm-tinted, never default red/green/yellow:
- **Tinggi:** `#FFE0CC` bg · `#B84A20` text · `#F5C4A8` border
- **Sedang:** `#FFF0D8` bg · `#5E3A10` text · `#F5D9A8` border
- **Rendah:** `#D4F5E5` bg · `#1D7A4A` text · `#8ADAB5` border

### Progress Bar
- **Track:** `10px` height, `#FFF0D8` fill, `999px` radius, `overflow: hidden`
- **Fill:** gradient `90deg` from `#9A6428` to `#E8BE78`; module variants use domain accent
- **Animation:** use `transform: scaleX` from `transform-origin: left` — not `width` transition (avoids layout thrash)

### Input Fields
- **Border:** `2px solid #F0D8B0`
- **Background:** `#FFF9F2` (cream-50)
- **Radius:** `12px`
- **Focus:** border shifts to `#D4A048`
- **Font:** Nunito 700, `0.875rem`, `#3A200A`

### Wallpaper Patterns
Five selectable room backgrounds applied to the main canvas:
- **Dots** (`wallpaper-dots`): `#FFF9F2` base + `#E8BE78` radial dots, `20px` grid
- **Gingham** (`wallpaper-gingham`): `#FFF8EE` base + diagonal honey weave, `16px` cell
- **Stars** (`wallpaper-stars`): `#FFF9F2` base + dual-pitch honey + sky dot field
- **Cloud** (`wallpaper-cloud`): `#EFF8FF` base + sky ellipse silhouettes
- **Plain** (`wallpaper-plain`): `#FFF8EE` — warm canvas, no pattern

### Wallpaper Quick-Switcher
Inline row of five `28×28px` round preview buttons in the Room Header; emoji as pattern proxy at `10px`.
- **At rest:** `opacity-70`, `border-2 border-white/70`
- **Active:** `box-shadow: 0 0 0 3px #9A6428`, `scale(1.1)` — using `.active` class on the swatch
- **Hover (inactive):** `opacity-100`, `scale(1.12)`, `0.15s ease` transition
- Persists to `localStorage` key `pebble_wallpaper` (instant) and syncs to the database via `upsertRoomSettings`; read on mount via `useRoom()` context

### Quick-add Modal
Bottom-sheet on mobile, centered `max-w-md` dialog on desktop. Triggered by the home FAB.
- **Shell:** `bg-white`, `rounded-t-[2rem]` mobile / `rounded-2xl` desktop, `border-2 border-room-border`
- **Handle pill:** `w-10 h-1 rounded-full bg-room-border` — visible mobile only
- **Backdrop:** `bg-cream-900/40 backdrop-blur-[2px]`
- **Animation:** `.modal-sheet[data-state="open"]` → `slide-up 0.32s cubic-bezier(.32,0,.15,1)` — Radix `data-state` drives the CSS keyframe
- **Tabs:** 3 full-width pill buttons (Tugas / Pengeluaran / Goal), each fills with domain accent when active
- **Save state:** button shifts to mint on success, shows `✓ Tersimpan!`, closes after 1s

### Welcome Overlay (Onboarding)
First-visit overlay. Shown once via `localStorage` key `pebble_welcomed`.
- **Same shell + animation** as Quick-add Modal
- **Illustration zone:** `bg-linear-to-br from-cream-100 via-cream-50 to-sky-50`, houses `PixelCat` + animated decorations
- **Feature list:** 3 `FeatureItem` rows with domain-accent icon containers (`w-8 h-8 rounded-xl`)
- **CTA primary:** cream-500 full-width button → `/settings`
- **CTA secondary:** bordered ghost button → dismiss only
- `z-60` / `z-61` (overlay + content) sit above the standard modal layer

### Task Inline Toggle
Checkmark button per task row in the Task Widget. Replaces the static priority dot.
- **Idle:** `<Circle>` icon, `text-room-subtle`, `hover:text-cream-400`
- **Done:** `<CheckCircle2>` icon, `text-mint-400`, with `.task-check-done` animation (`check-pop` keyframe: scale 1→1.35→1 over `0.22s`)
- **Done text:** `line-through text-room-subtle` on title; deadline badges hidden when done
- State managed in `useState<Set<string>>` local to the widget — persists for the session only until backend is wired

### Settings Page
Three-card layout: Identitas Ruangan, Wallpaper & Tema, Akun.
- **Identitas Ruangan** (`SettingsIdentity` client component): controlled inputs for `roomName` and `userName`. Saves on blur and on Enter press via `useRoom().setRoomName` / `setUserName`. Updates localStorage + DB + context simultaneously. Shows "Tersimpan otomatis" mint confirmation for 2s after save.
- **Wallpaper & Tema** (`SettingsPickers` client component): five wallpaper preview tiles + five theme color swatches. Both save instantly on click; theme applies `data-theme` attribute on `<html>` and persists to localStorage `pebble_theme` + DB.
- **Akun**: shows Google avatar, name, and email from session. Contains sign-out form action (`signOut({ redirectTo: "/login" })`).

### Theme Color System
Five themes override the primary color scale via `data-theme` attribute on `<html>`:
| Theme | `cream-500` | `room-border` override |
|---|---|---|
| `cream` (default) | `#9A6428` | `#F0D8B0` |
| `sky` | `#6AA0D4` | `#CBE7FF` |
| `peach` | `#E08A5E` | `#FFD9C4` |
| `mint` | `#38A571` | `#B8EDD3` |
| `rose` | `#D8607A` | `#FFCCD6` |
The override block (`[data-theme="sky"] { ... }`) appears before the `@theme` block in `globals.css`. The entire cream scale (50–700) and `room-border` shift to match the selected hue. All other tokens (canvas, neutrals, accent modules) are unchanged.

### Room Context (`RoomProvider`)
State tracked: `wallpaper`, `roomName`, `userName`, `themeColor`. All four:
1. Read from `localStorage` on mount (instant, no flash)
2. Sync from DB via `getRoomSettings()` after mount (fills gaps if localStorage is empty)
3. Written to `localStorage` + DB on every change
`themeColor` additionally sets `document.documentElement.dataset.theme` for live CSS override.
Keys: `pebble_wallpaper`, `pebble_room_name`, `pebble_user_name`, `pebble_theme`.

## Do's and Don'ts

**Do:**
- Tint every shadow with `rgba(154,100,40,…)` — warm amber, not grey weight
- Use module accent consistently: Queue → Cream/Honey, Finance → Peach+Sky, Goals → Mint
- Set `2px` borders on all cards — `1px` vanishes on warm backgrounds at high DPI
- Keep pixel-art decorations on a `16px` or `24px` grid with `shapeRendering: crispEdges`
- Write all copy in Bahasa Indonesia — calm, first-person, encouraging
- Use Nunito at 600 weight minimum — lighter weights lose the roundedness

**Don't:**
- Use `rgba(0,0,0,…)` or grey in shadows — this system has no grey
- Use `#000000` or near-black for text — use `#3A200A` (Room Text)
- Animate `width` or `height` directly on progress fills or layout elements — use `transform: scaleX/Y` for performance
- Apply `border-radius` to pixel-art SVG assets — they are intentionally crisp
- Add emoji as the primary icon system — inline pixel SVGs are the vocabulary; emoji are decorative accents only
- Let secondary text fall below `#7A5838` in live body copy — `#B09070` is for disabled/strikethrough only
- Cross the Domain-Color Rule: a mint badge on a Queue task tells the user it belongs to Goals
