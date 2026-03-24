# Design System Strategy: The Studio Aesthetic

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Atelier."** 

Unlike standard SaaS platforms that feel like utilitarian tools, this system is designed to feel like a high-end creative workspace. It rejects the "boxed-in" nature of traditional web grids in favor of **Tonal Architecture**. We achieve a premium feel through high-contrast typography, expansive whitespace (the "Luxury of Space"), and a depth model based on light refraction rather than physical borders. It is an environment where the interface recedes to let the creative output (AI imagery or professional content) breathe.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
This system moves away from "flat" design. We use a sophisticated spectrum of charcoals and deep indigos to create an atmosphere of focused creativity.

### The Palette
*   **Neutral Foundation:** `surface` (#131313) serves as our canvas.
*   **Primary Accent:** `primary` (#c3c0ff) and `primary_container` (#4f46e5) provide the "electric" energy of AI and innovation.
*   **The "No-Line" Rule:** **1px solid borders are strictly prohibited for sectioning.** To define boundaries, use background shifts. For example, a `surface_container_low` section should sit directly against a `surface` background. The shift in hex value is the border.
*   **Surface Hierarchy & Nesting:** Treat the UI as layers of stacked obsidian.
    *   *Base:* `surface`
    *   *Mid-ground:* `surface_container`
    *   *Foreground/Active:* `surface_container_highest`
*   **The "Glass & Gradient" Rule:** Floating modals and navigation rails must use **Glassmorphism**. Apply `surface_container` at 70% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** Use subtle linear gradients for primary CTAs, transitioning from `primary` (#c3c0ff) to `tertiary_container` (#2346fa) at a 135-degree angle. This adds a "lithographic" soul to the buttons.

---

## 3. Typography: The Editorial Scale
We pair **Manrope** (Display/Headlines) with **Inter** (Body/UI) to create a high-fashion, editorial contrast.

*   **Display (Manrope):** Use `display-lg` (3.5rem) with `-0.04em` letter spacing for hero sections. It should feel authoritative and cinematic.
*   **Headlines (Manrope):** `headline-md` (1.75rem) should be used for section titles to maintain a "Studio" portfolio feel.
*   **Body (Inter):** `body-md` (0.875rem) is the workhorse. Increase line height to `1.6` to ensure the "spacious" requirement is met.
*   **Labels (Inter):** `label-md` should always be in `uppercase` with `0.1em` letter spacing when used for micro-headers or categories.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for this aesthetic. We use light and opacity to define height.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface_container_lowest` card inside a `surface_container_high` section to create a "recessed" look.
*   **Ambient Shadows:** For floating elements (like dropdowns), use a shadow color tinted with the `on_surface` (#e5e2e1) at 5% opacity, with a `40px` blur and `10px` Y-offset. It should feel like a soft glow, not a shadow.
*   **The "Ghost Border" Fallback:** If a layout requires a container edge for accessibility, use the `outline_variant` token at **15% opacity**. It should be barely perceptible.
*   **Corner Radii:** Use `ROUND_TWELVE` (`xl`: 1.5rem) for main containers and `md` (0.75rem) for inner components like buttons or inputs. This creates a "nested" visual harmony.

---

## 5. Components

### Buttons
*   **Primary:** A gradient fill (Primary to Tertiary Container). Rounded-full (`9999px`). No border. Text in `on_primary_fixed` (Deep Indigo).
*   **Secondary:** Ghost style. `outline_variant` at 20% opacity. On hover, the background shifts to `surface_container_high`.
*   **Tertiary:** Pure text with `label-md` styling. High-contrast color (`primary`).

### Input Fields
*   **Styling:** Forgo the "box." Use a `surface_container_low` fill with a bottom-only `outline_variant` (20% opacity). 
*   **Focus State:** The bottom border transitions to 100% `primary` opacity with a subtle `primary` outer glow (4px blur).

### Cards & Lists
*   **Rule:** **No dividers.**
*   **Implementation:** Separate list items using the `spacing-4` (1.4rem) scale. For cards, use background color shifts (`surface_container_low` vs `surface_container_highest`).
*   **Interaction:** On hover, a card should scale slightly (1.02x) and transition its background color rather than adding a thick border.

### Additional Component: The "Studio Glass" Header
*   A fixed top navigation using `surface` at 60% opacity, `backdrop-blur: 12px`, and a `15% outline_variant` bottom "Ghost Border."

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but allow imagery to bleed off-grid or sit offset to create visual interest.
*   **Use the Spacing Scale:** Stick strictly to the defined increments (e.g., `spacing-12` for section gaps) to maintain a rhythmic, intentional feel.
*   **Prioritize Visual Hierarchy:** The most important action should be the only element using the `primary` gradient.

### Don’t:
*   **Don't use pure black (#000000):** Use `surface` (#131313) to allow for depth and "on-surface" readability.
*   **Don't use 100% opaque borders:** They break the "Studio" aesthetic and make the UI feel like a generic template.
*   **Don't crowd the content:** If a section feels "busy," increase the padding using `spacing-16` or `spacing-20`. High-end design requires the courage to leave parts of the screen empty.