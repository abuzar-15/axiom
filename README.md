# Axiom Scientific Calculator

<div align="center">
  <h3>Professional, High-Precision, Universal Scientific Calculator</h3>
  <p>Universal design built for everyone — sighted users, screen reader navigators (NVDA, JAWS, VoiceOver, TalkBack), desktop & laptop power users, and touch-first Android & iOS smartphone users.</p>
</div>

---

## Overview

**Axiom** is a modern, high-precision scientific calculator web application built entirely from scratch with vanilla **HTML5**, **CSS3**, and **modern JavaScript (ES6+)**. It requires **zero external frameworks**, **zero runtime dependencies**, and **zero internet connection** — running instantly in any web browser by opening `index.html`.

Axiom unites two design philosophies that are often kept separate:
1. **Sleek, Modern Universal UI/UX**: An Obsidian/Slate visual design system with smooth tactile buttons, subtle top bevel highlights, clean typography, vibrant gradients, and a dedicated mobile-adaptive segmented keypad switcher (`123 Basic` / `fx Scientific` / `All Keys`).
2. **Uncompromising Universal Accessibility (WCAG 2.2 AA / AAA)**: 100% active screen reader support with unabbreviated accessible names, intelligent token-aware backspace announcements, dual-slot ARIA live regions, procedural Web Audio API feedback, and full keyboard operability without technical clutter dominating the interface.

---

## Key Features

### 1. Modern Universal UI/UX & Brand Identity
- **Distinctive Axiom Logo & Insignia**: Geometric Sigma ($\Sigma$) and Infinity ($\infty$) vector badge symbolizing mathematical rigor and continuity.
- **Obsidian & Slate Theme**: Ergonomic dark palette (`#080c16` / `#0f172a`) with glowing accent rings, high-legibility display, and color-coded button groups.
- **Multiple Color Themes**:
  - **Dark Navy / Slate** (Default, modern high-tech workspace)
  - **High Contrast (WCAG AAA)** (Ultra-high contrast with vibrant neon borders for maximum legibility)
  - **Clean Pearl Light Theme** (Crisp daytime aesthetic with subtle shadows)
- **Tactile Button Interaction**: Buttons feature top highlights, distinct hover states, micro-interaction active press animations (`scale(0.97)`), and unmistakable WCAG 2.2 focus outlines.

### 2. Responsive Multi-Device Architecture
- **Desktop & Laptop Workstation**: Side-by-side dual grid layout featuring scientific functions on the left and standard keypad on the right.
- **Android & Mobile Touch Optimization**:
  - Segmented view switcher (`123 Basic`, `fx Scientific`, `All Keys`) dynamically adapts the keypad for single-hand or focused touch input.
  - Large touch targets ($\ge 48\text{px}$) compliant with WCAG 2.2 Target Size criteria.
  - Zero horizontal scrolling with fluid viewport scaling (`100dvh` / `clamp`).

### 3. Deep Mathematical Engine (Safe & Accurate)
- **Zero `eval()` / Zero `Function()`**: Safe tokenization, Dijkstra's Shunting-Yard parser, and Reverse Polish Notation (RPN) stack evaluator.
- **Full Operator Precedence & Associativity**: Proper order of operations ($*$, $/$, $+$, $-$) and right-associative exponentiation ($2^{3^2} = 512$).
- **Implicit Multiplication**: Handles $2(3+5) = 16$ and $(2+1)(3+2) = 15$ effortlessly.
- **Trigonometric Modes**: Full Degree (DEG), Radian (RAD), and Gradian (GRAD) support with exact boundary corrections ($\sin(180^\circ) = 0$, $\cos(90^\circ) = 0$).
- **Hyperbolic & Inverse Functions**: $\sinh$, $\cosh$, $\tanh$, $\text{asinh}$, $\text{acosh}$, $\text{atanh}$, and complete secondary trig ($\csc$, $\sec$, $\cot$).
- **Roots, Powers & Exponentials**: $x^2$, $x^3$, $x^y$, $\sqrt{x}$, $\sqrt[3]{x}$, $\sqrt[y]{x}$, $1/x$, $e^x$, $10^x$, $2^x$.
- **Logarithms**: Natural ($\ln$), Common ($\log_{10}$), Binary ($\log_2$), and arbitrary base logarithms.
- **Combinatorics & Discrete Math**: Factorials ($n!$), Permutations ($nPr$), Combinations ($nCr$), Modulo ($\%$), GCD, and LCM.
- **Exact Fraction & Decimal Conversion ($F \Leftrightarrow D$)**: Converts decimal results to reduced proper or mixed fractions (e.g., $0.75 \Leftrightarrow 3/4$, $2.375 \Leftrightarrow 19/8\ (2\ 3/8)$).
- **Engineering Notation ($ENG$)**: Normalizes numerical exponents to engineering multiples of 3 (e.g., $47000 \rightarrow 47 \times 10^3$).
- **Multi-Base System**: Instant cycling between Decimal (DEC), Hexadecimal (HEX), Binary (BIN), and Octal (OCT).
- **Physical Scientific Constants Library**: 15 fundamental physical constants ($c, h, \hbar, G, N_A, k_B, e, m_e, m_p, R, \sigma, g, \text{atm}, \varepsilon_0, \mu_0$) with modal search, symbol references, SI units, and direct calculation insertion.
- **Statistical Analysis Tool**: Descriptive statistics calculator ($N, \Sigma x, \Sigma x^2, \bar{x}, \text{median}, \min, \max, \text{range}, s, \sigma, s^2, \sigma^2$) with one-click Recall into the active calculation.

### 4. Accessibility Architecture (TalkBack, NVDA & JAWS)
- **TalkBack on Android Certified**: 
  - Standard semantic landmark navigation without `role="application"` interference, allowing touch-to-explore and swipe-right/left navigation across all buttons.
  - Interactive formula and result display with `tabindex="0"` and dynamic `aria-label` updates for instant readout upon touch or swipe.
  - Background isolation (`aria-hidden="true"` and modern `inert`) on modal dialogs so TalkBack cannot leak out into underlying buttons.
  - Debounced alert announcements (70ms) preventing button touch events from drowning out calculation results.
  - Native touch responsiveness with `touch-action: manipulation;` and zero-delay tap handling.
- **NVDA & JAWS on Windows**: Full keyboard access with top-row and numpad numbers, unabbreviated speech labels (`sin` is announced as "Sine", `+` as "Addition"), and dual-slot live regions.
- **Intelligent Token-Aware Backspace**: Pressing Backspace deletes the atomic token (whether a digit, operator, or function like `sin(`) and announces both the deleted item and the remaining value (e.g. *"5 deleted. Current value: 12"*).
- **Dual-Slot Live Regions**: Alternating live spans prevent browser text deduplication so consecutive identical outputs (e.g., repeated zeros or results) are consistently voiced.
- **Display Read-Out**: Press <kbd>D</kbd>, tap **Speak**, or tap the display on touch devices to hear the active display value; press <kbd>F</kbd> to hear the entire formula.
- **Zero-Latency Procedural Audio Feedback**: 10 distinct tone profiles synthesized via Web Audio API (sine click, operator tone, scientific confirmation, calculation chord, clear sweep, error buzzer).

---

## Production Project Structure

```text
Axiom-Calculator/
│
├── index.html                 # Main Web Application (Entry point to run and host)
├── README.md                  # Documentation, user manual, and legal notice
│
├── css/
│   └── style.css              # Obsidian/Slate design system, High-Contrast AAA, responsive layout
│
├── js/
│   ├── calculator.js          # Core mathematical calculation engine (Shunting-Yard & RPN)
│   ├── accessibility.js       # ARIA live announcer, focus management, and settings storage
│   └── audio.js               # Procedural Web Audio API sound synthesizer
│
└── assets/
    └── sounds/
        └── README.txt         # Explanatory architectural note
```

---

## How to Run & Host

Axiom is a 100% static, client-side web application. It requires zero server runtimes, zero databases, zero Node packages, and zero build processes.

### 1. Run Locally (Offline)
- Simply double-click [index.html](file:///c:/Users/abuza/Documents/project/index.html) in your file manager to open it in Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari.

### 2. Host on GitHub Pages (Free)
1. Push this project folder to a GitHub repository.
2. In the GitHub repository, navigate to **Settings** &rarr; **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`, then click **Save**.
4. Your calculator will be live instantly with HTTPS!

### 3. Host on Netlify / Vercel / Cloudflare Pages (Free)
- Drag-and-drop this project folder into the Netlify or Vercel dashboard. Because `index.html` is in the root, it deploys automatically in seconds.

### 4. Host on Any Standard Web Server
- Upload these files directly to the root `public_html/` or `www/` directory of your Apache, Nginx, or LiteSpeed web hosting server.

---

## Keyboard Shortcuts Reference

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `0` – `9` | Digits | Enter numbers (supports top-row and numpad) |
| `.` | Decimal | Insert decimal separator |
| `+`, `-`, `*`, `/` | Basic Operators | Addition, Subtraction, Multiplication, Division |
| `Enter` or `=` | Calculate | Compute expression result and voice output |
| `Backspace` | Token Backspace | Deletes last character or function token with speech |
| `Delete` | Clear Entry (CE) | Clears current input value |
| `Escape` | All Clear (AC) | Resets calculator / Closes open dialogs |
| `(` and `)` | Parentheses | Open and close grouped sub-expressions |
| `^` | Power ($x^y$) | Exponentiation |
| `%` | Percentage | Divides current value by 100 |
| `!` | Factorial ($n!$) | Factorial calculation |
| `s`, `c`, `t` | Trig Shortcuts | Fast input for `sin`, `cos`, `tan` |
| `l`, `g` | Logarithms | Fast input for `ln` and `log10` |
| `r` | Square Root | Square root ($\sqrt{x}$) |
| `p`, `e` | Constants | Insert $\pi$ (3.14159...) and Euler's constant $e$ (2.71828...) |
| `d` or `Alt + D` | Read Display | Read current display value aloud |
| `f` or `Alt + F` | Read Formula | Read full formula expression aloud |
| `Alt + M` | Angle Mode | Cycle Angle Mode (DEG &rarr; RAD &rarr; GRAD) |
| `Alt + B` | Base Mode | Cycle Number Base (DEC &rarr; HEX &rarr; BIN &rarr; OCT) |
| `Alt + N` | Fraction Toggle | Toggle Fraction and Decimal representation ($F \Leftrightarrow D$) |
| `Alt + E` | Engineering | Toggle Engineering notation ($ENG$) |
| `Alt + C` | Constants Library | Open Scientific Physical Constants Library dialog |
| `Alt + T` | Statistics Tool | Open Descriptive Statistical Analysis dialog |
| `Alt + H` | History | Open Calculation History dialog |
| `Alt + S` | Settings | Open Preferences & Settings dialog |
| `F1` or `?` | User Guide | Open Keyboard Shortcuts & Help dialog |

---

## Automated Test Suite

Axiom includes an automated test runner (`test_runner.html`) that tests all mathematical, formatting, accessibility, and storage modules.

### Running the Test Suite
Open `test_runner.html` directly in Chrome, Firefox, or run via headless browser:

```powershell
Start-Process 'chrome.exe' -ArgumentList @('--headless=new', '--dump-dom', '--no-sandbox', 'test_runner.html')
```

### Test Suite Coverage (145 Assertions, 100% Pass Rate)
- **Arithmetic & Operator Precedence**: Order of operations, unary negation, implicit multiplication, parentheses nesting.
- **Trigonometry**: Sine, cosine, tangent, secant, cosecant, cotangent in DEG, RAD, and GRAD modes.
- **Hyperbolic & Inverse**: $\sinh$, $\cosh$, $\tanh$, $\text{asinh}$, $\text{acosh}$, $\text{atanh}$.
- **Powers, Roots & Logarithms**: Square, cube, power $x^y$, $\sqrt{x}$, $\sqrt[3]{x}$, $\sqrt[y]{x}$, $\ln$, $\log_{10}$, $\log_2$, $e^x$, $10^x$, $2^x$.
- **Discrete Math**: Factorials ($0! = 1$, $5! = 120$, $10! = 3628800$), permutations ($nPr$), combinations ($nCr$), modulo, absolute value.
- **Constants**: $\pi$, $e$, $\tau$, $\phi$ accurate to 12 decimal places.
- **Error Handling**: Division by zero, negative square root, out-of-domain trig / logarithms, unmatched parentheses.
- **Memory Operations**: $MC, MR, M+, M-, MS$ state handling and display badge updates.
- **Speech & Live Regions**: Token-aware backspace voice announcements, dual-slot alternation, result alerts.
- **Advanced Features**: Fraction conversion ($F \Leftrightarrow D$), engineering notation ($ENG$), base cycling (DEC/HEX/BIN/OCT), physical constants insertion, and 12-statistic descriptive analysis engine.

---

## Customization & User Preferences

All preferences are adjusted in the **Preferences & Settings** dialog (<kbd>Alt + S</kbd>) and persist automatically in `localStorage`:
- **Theme Palette**: Choose between Dark Navy / Slate, WCAG AAA High Contrast, and Clean Light Theme.
- **Sound Feedback**: Enable or disable Web Audio API tone feedback.
- **Beep Volume**: Fine-tune audio tone volume from 0% to 100%.
- **Button Click Beeps**: Toggle individual keypad click sounds.
- **Spoken Announcements**: Toggle live screen reader announcements for results and keypresses.
- **Large Buttons Mode**: Increases keypad button touch target sizes to $> 58\text{px}$.
- **Large Display Text**: Enlarges display formula and result typography for low-vision comfort.
- **Reduce Motion**: Removes animations and transitions for sensitive users.

---

## Author & Contact

**Mohammad Abuzar Alam**  
*Creator and Lead Developer of Axiom Scientific Calculator.*

For inquiries, feature suggestions, feedback, or accessibility recommendations:
- **Email**: `abuzaraalam34@gmail.com`
- **Application**: Click **Help** (<kbd>F1</kbd>) or use the **Feedback & Contact** footer link directly within Axiom.

---

## Copyright & License

Copyright &copy; 2026 **Mohammad Abuzar Alam**. All rights reserved.

This application is designed and engineered from scratch using accessible vanilla web standards (HTML5, CSS3, Vanilla ES6+ JavaScript). Unauthorized duplication, alteration, or commercial redistribution without prior written consent from the author is strictly prohibited.
