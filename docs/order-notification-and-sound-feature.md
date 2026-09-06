# Velora POS — Order Notification, Sound Alerts & Owner Configuration System

## 1. Executive Summary

In fast-paced Quick Service Restaurant (QSR) and cafe environments, order awareness and operational fluidity are paramount. Cashiers, baristas, and cafe managers often operate in multi-tasking environments where looking at a screen continuously is impractical.

The **Velora Order Notification & Alert System** delivers an end-to-end, multi-sensory notification pipeline designed specifically for hospitality spaces:
1. **Auditory Notification Engine**: Synthesizes 4 pleasant, cafe-friendly harmonic chimes (3s to 5s) directly in the browser via HTML5 Web Audio API — eliminating harsh buzzer noises, network audio latency, and broken asset links.
2. **Visual Order Popup Toast**: Provides an onscreen notification displaying order totals, payment method badges, item previews, and an animated progress auto-dismiss bar.
3. **Navbar Order Management & Wash-Out**: Live notification bell in the Admin Header displaying only today's unread orders with single-click individual and bulk "Wash Out" clearing mechanisms.
4. **Owner Configuration Center**: A dedicated tab in `/settings` giving owners complete control over sound toggling, live sound previews, volume leveling, toast visibility, and display durations.

---

## 2. Core Functional Requirements

### 2.1 Acoustic Cafe-Friendly Sound Synthesis
- Replaces generic/harsh buzzers with acoustic-grade, soothing harmonic frequencies.
- Synthesized in real time using native Web Audio API oscillators and gain envelopes (0 external `.mp3`/`.wav` requests).
- Four calibrated sound profiles ranging from 2.8s to 4.2s:
  - **Warm Harmonic Cafe Bell** (`cafe-bell`, ~3.5s): Warm brass service chime with rich sub-harmonics and natural exponential decay.
  - **Artisan Marimba Chime** (`marimba-chime`, ~3.2s): Smooth wooden mallet timbre (C5, E5, G5, C6) with gentle attack and warm resonance.
  - **Crystal Service Ding** (`crystal-ding`, ~2.8s): Crisp counter service bell with bright metallic shimmer.
  - **Melodic Cafe Harp** (`melodic-harp`, ~4.2s): Upward rising 5-note harp arpeggio (C5 → E5 → G5 → B5 → D6) conveying premium cafe ambience.
- Respects browser autoplay policies with automated audio context resume on user interaction.
- **Admin Panel Scoping**: Audio chimes play **exclusively** on the Admin Panel / Dashboard side (`/dashboard`, `/menu`, `/inventory`, `/tables`, `/settings`). Terminal screens (`/pos?mode=quick`, `/pos?mode=table`) are strictly silenced to avoid distracting cashiers during active billing.

### 2.2 Visual Onscreen Order Notification Toast
- Displayed **only** on Admin Panel views (suppressed on all `/pos` terminal screens).
- Slides in from top-right whenever an order is completed or received:
  - **Header**: Pulsing green bell badge, Order ID (`Order #2 Placed & Completed!`), and manual dismiss button.
  - **Financial Summary**: Currency-formatted total (`₹420.00`) and payment tender badge (`CASH`, `UPI`, `CARD`, `SPLIT`).
  - **Order Preview**: Item count badge and comma-separated preview chips (e.g., `2x Cappuccino, 1x Hazelnut Croissant`).
  - **Visual Countdown Bar**: Synchronized progress bar indicating time remaining before auto-dismissal.

### 2.3 Navbar Notification Bell & Order Wash-Out
- Located in the Admin Panel Header ([`Header.tsx`](file:///c:/Learning/projects/vidhara-qsr/frontend/src/components/common/Header.tsx)).
- **Strict "Today" Filter**: Evaluates `order.date` against local calendar date (`d.toDateString() === today.toDateString()`). Prior days' orders never populate the active badge.
- **Individual Wash-Out**: Each order card has a checkmark action button to mark as read and clear immediately.
- **Bulk Wash-Out ("Mark all read")**: Instantly commits all today's orders to persistent read storage (`localStorage: velora_read_notifications`) and resets the bell badge to 0.
- **Persistent State**: Read order IDs persist across page reloads and tab closures.
- **Today's Cleared Orders Drawer**: Expandable accordion at the bottom of the popover allowing cashiers to review cleared orders from earlier today if needed.

### 2.4 Daily Sequential Order Numbering (`#1`, `#2`, `#3`... Resetting Everyday)
- In cafe and QSR operations, order tokens / ticket numbers must restart from `#1` at the beginning of each business day.
- Prevents customer and cashier confusion caused by cumulative database auto-increment IDs (e.g. displaying `#10` when only 2 orders were placed today).
- **Backend Resolution** ([`order.service.ts`](file:///c:/Learning/projects/vidhara-qsr/backend/src/order/order.service.ts)):
  - Both `create()` and `findAll()` calculate the calendar day's 1-based order index (`dailyOrderNumber`).
  - Stored and transmitted with each order payload.
- **Frontend Resolution** ([`orderUtils.ts`](file:///c:/Learning/projects/vidhara-qsr/frontend/src/lib/orderUtils.ts)):
  - `buildDailyOrderNumberMap(allOrders)` maps `order.id` $\to$ daily sequence index.
  - Automatically applied in **Header notifications**, **Today's Cleared Orders**, **Order Notification Toast**, and **Dashboard Recent Activity**.

### 2.5 Owner Configuration Center
- Accessible via the **Owner Configuration** tab in `/settings` ([`SettingsView.tsx`](file:///c:/Learning/projects/vidhara-qsr/frontend/src/components/settings/SettingsView.tsx)).
- **Master Audio Toggle**: Instantly switch order completion chimes ON or OFF.
- **Tone Selection with Live Audition**: Interactive tone cards with individual **"Test Sound"** buttons allowing the owner to preview chimes at the current volume.
- **Volume Controller**: Precise range slider from 10% to 100%.
- **Popup Duration Picker**: Configure onscreen toast visibility duration: **3s, 4s, 5s, or 8s**.
- **Backend Persistence**: Automatically saves settings to the MySQL database via NestJS `/setting` endpoint.

---

## 3. System Architecture & Event Orchestration

```mermaid
flowchart TD
    subgraph POS["POS Station (Checkout)"]
        A[Cashier Completes Order] -->|Dispatches| B[window.dispatchEvent\n'velora-order-completed']
    end

    subgraph Background["Background Polling (Cross-Terminal)"]
        C[syncRelatableData / refreshOrders] -->|Detects New Order ID| B
    end

    subgraph Listeners["Global Event Listeners"]
        B --> D[OrderNotificationToast.tsx]
        B --> E[Web Audio Engine sound.ts]
        B --> F[Header.tsx Navbar Bell]
    end

    subgraph AudioEngine["sound.ts"]
        E -->|Check Settings| G{Sound Enabled?}
        G -->|Yes| H[Synthesize Selected Tone\ncafeAudio.play(tone, volume)]
        G -->|No| I[Silent]
    end

    subgraph ToastUI["Toast UI"]
        D -->|Check Settings| J{Popup Enabled?}
        J -->|Yes| K[Render Toast with Countdown Bar]
        J -->|No| L[Suppress Toast]
    end

    subgraph SettingsTab["Settings > Owner Configuration"]
        M[Owner Adjusts Tone / Volume / Duration] -->|PUT /setting| N[(MySQL Setting Table)]
        N -->|Refreshed into| O[AppContext.settings]
        O -.-> G
        O -.-> J
    end
```

---

## 4. Audio Synthesis Technical Specifications

All audio is generated procedurally using the Web Audio API without downloading audio binary files. This guarantees zero network failures, zero licensing friction, and instantaneous playback.

### 4.1 Harmonic Frequency Matrix

| Tone Key | Name | Duration | Primary Frequencies (Hz) | Oscillator Types | Envelope Decay |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cafe-bell` | Warm Harmonic Cafe Bell | 3.5s | 880 (A5), 1760 (A6), 1108 (C#6), 440 (A4) | Sine + Triangle mix | Exponential decay ($\tau = 3.5s$) |
| `marimba-chime` | Artisan Marimba Chime | 3.2s | 523.25 (C5), 659.25 (E5), 783.99 (G5), 1046.5 (C6) | Sine with rapid transient attack | Exponential decay ($\tau = 3.0s$) |
| `crystal-ding` | Crystal Service Ding | 2.8s | 1318.5 (E6), 2637 (E7), 987.77 (B5) | Sine with metallic frequency modulation | Crisp decay ($\tau = 2.5s$) |
| `melodic-harp` | Melodic Cafe Harp | 4.2s | 523.25 (C5) → 659.25 (E5) → 783.99 (G5) → 987.77 (B5) → 1174.66 (D6) | Sine arpeggio staggered at 90ms intervals | Blended sustain ($\tau = 4.0s$) |

### 4.2 Web Audio Node Graph

```mermaid
graph LR
    subgraph AudioContext
        Osc1[Oscillator 1: Fundamental] --> Gain1[GainNode: Harmonic Weight]
        Osc2[Oscillator 2: Harmonic 1] --> Gain2[GainNode: Harmonic Weight]
        Osc3[Oscillator 3: Sub-Body] --> Gain3[GainNode: Harmonic Weight]
        Gain1 --> MasterGain[Master Exponential Gain Envelope]
        Gain2 --> MasterGain
        Gain3 --> MasterGain
        MasterGain --> Destination[AudioContext.destination (Speakers)]
    end
```

### 4.3 Autoplay & Browser Permission Management
Browsers enforce strict user-gesture policies before playing audio (`AudioContextState === 'suspended'`).
- The `cafeAudio.play()` method checks `ctx.state === 'suspended'` and calls `await ctx.resume()`.
- The live "Test Sound" button in Settings gives users an immediate interaction trigger that permanently unlocks the audio context for subsequent automated order events.

---

## 5. Configuration Schema & Storage

Owner configuration options are stored as key-value pairs in the MySQL `Setting` table and synchronized into the global `AppContext`.

### 5.1 Configuration Keys

| Setting Key | Type | Default | Options | Description |
| :--- | :--- | :--- | :--- | :--- |
| `orderSoundEnabled` | `string` (`"true"` \| `"false"`) | `"true"` | `"true"`, `"false"` | Master switch for order completion sound alerts. |
| `orderSoundTone` | `string` | `"cafe-bell"` | `cafe-bell`, `marimba-chime`, `crystal-ding`, `melodic-harp` | Active chime sound timbre. |
| `orderSoundVolume` | `string` | `"75"` | `"10"` to `"100"` | Output volume percentage. |
| `orderPopupEnabled` | `string` (`"true"` \| `"false"`) | `"true"` | `"true"`, `"false"` | Master switch for onscreen popup notification toasts. |
| `orderPopupDuration`| `string` | `"4"` | `"3"`, `"4"`, `"5"`, `"8"` | Auto-dismiss countdown duration in seconds. |

### 5.2 API Interaction Example

#### Request: Save Owner Notification Preferences
```http
POST /setting HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "orderSoundEnabled": "true",
  "orderSoundTone": "marimba-chime",
  "orderSoundVolume": "85",
  "orderPopupEnabled": "true",
  "orderPopupDuration": "5"
}
```

#### Response:
```json
{
  "success": true
}
```

---

## 6. Duplicate Prevention & Cross-Terminal Reliability

To ensure sound and notifications behave predictably across multiple tabs, cashier stations, and background syncs:
1. **Order Completion in POS**: When an order is placed locally via `confirmPaymentAndOrder()`, the order payload is attached to `velora-order-completed` and flagged in `handledOrderIds`.
2. **Background Polling Detection**: When `syncRelatableData()` or `refreshOrders()` pulls fresh orders from the database:
   - Evaluates whether `isOrdersInitializedRef` is true (preventing chimes on initial page boot).
   - Identifies any incoming order whose ID is absent from `knownOrderIdsRef`.
   - Fires `velora-order-completed` so other screens (e.g., Admin dashboard, Kitchen station) receive the alert.
3. **Double-Play Guard**: `OrderNotificationToast` tracks `handledOrderIds` in a React ref, preventing repeated sounds or duplicate toasts if multiple poll events arrive concurrently.

---

## 7. User Guide: Managing Notifications & Alerts

### 7.1 How to Change the Chime Sound & Volume
1. Open the Admin Panel and navigate to **Settings** (`/settings`).
2. Select the **Owner Configuration** tab in the top navigation switcher.
3. Under **Order Completion Chime Sound**, ensure the switch is **Enabled**.
4. Browse the available chimes:
   - Click the **"Test Sound"** button on any card to audition the chime.
   - Click on your preferred chime card to select it (highlighted with an emerald border and checkmark).
5. Adjust the **Chime Volume** slider to match your cafe's background noise level.
6. Click **Save Configuration** at the bottom-right of the card. A confirmation toast will confirm changes are persisted.

### 7.2 How to Configure the Onscreen Popup Toast
1. In the **Owner Configuration** tab, locate **Onscreen Order Popup Alert**.
2. Toggle the switch ON or OFF according to your preference.
3. Choose the auto-dismiss time: **3s**, **4s**, **5s**, or **8s**.
4. Click **Save Configuration**.

### 7.3 How to Clear & Wash Out Navbar Notifications
1. In the Admin Panel Header, click the **Bell Icon** (badge shows the count of today's unread orders).
2. To clear an individual order: Hover over the order card and click the checkmark icon (**Mark read & clear**).
3. To clear all orders at once: Click **"Mark all read"** in the popover header.
4. The notification list immediately washes out to an **"All caught up!"** clean state.
5. To review cleared orders later in the shift, click the **"Today's Cleared Orders"** drawer at the bottom of the popover.

---

## 8. Verification & Build Integrity

- **Frontend Compilation**: Built with `tsc -b && vite build` — 0 errors.
- **Backend Compilation**: Built with NestJS `nest build` — 0 errors.
- **Compatibility**: Tested across modern desktop and tablet browsers (Chromium, Firefox, Safari) with zero external audio codecs required.
