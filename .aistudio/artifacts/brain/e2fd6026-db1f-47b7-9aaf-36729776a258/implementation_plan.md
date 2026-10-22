# CodeTogether — Social Collaborative Coding Platform

CodeTogether is an interactive, developer-focused social coding platform where programmers solve algorithmic problems together, collaborate in real-time rooms with Monaco Editor and live video/chat, compete in 1v1 coding battles, track progress, and manage room subscriptions.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions have been confirmed through initial clarification:

- **Confirmed Decision 1 (Google Sheets Integration)**: CodeTogether integrates Google Workspace Sheets API to allow users to export coding room sessions, test histories, battle scores, and algorithm solutions directly into a connected Google Sheet spreadsheet.
- **Confirmed Decision 2 (Code Execution & Verification)**: Safe sandboxed in-browser Web Worker execution engine with test suite assertion for immediate zero-latency feedback, paired with plug-and-play Judge0 API integration configuration for external compiler support (Python, C++, Java, JS).
- **Confirmed Decision 3 (Video Calling)**: Jitsi Meet IFrame integration (`meet.jit.si`) seamlessly embedded inside collaborative rooms with camera, mic toggles, participant grid, and flexible docking/floating controls so users can code without screen clutter.
- **Confirmed Decision 4 (Subscription & UPI QR Payment)**: Exact ₹20/month per additional member beyond 2 free slots (`max(0, slots - 2) * 20`). Displays the user's uploaded UPI QR code asset with transaction ID / UTR verification flow, admin approval ledger, and strict room capacity enforcement.

---

## 1. Overview & Core Concept

- **What It Does**: A comprehensive full-stack social IDE that brings competitive programming and pair-programming to life. Users can spin up rooms, invite peers with a room code, solve curated or LeetCode-linked challenges in a shared Monaco editor with cursor awareness, talk via live video and chat with emoji reactions, battle peers in synchronized private-editor showdowns, and track their stats.
- **Target Audience / Persona**: Students preparing for technical interviews, coding study groups, hackathon teammates, competitive programmers, and coding mentors.
- **Key Value**: Eliminates the friction of juggling Discord, LeetCode, screen sharing, and code editors by uniting video, real-time code collaboration, test execution, problem discussions, and subscription management in one cohesive developer interface.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Authentication & Profile Setup**:
   - Google Sign-In (Firebase Authentication) + optional email/demo switch.
   - User profile with username, avatar, rating/rank tier (Bronze to Grandmaster), total solves, battle win rate, and friend list.
2. **Dashboard Hub**:
   - Quick Actions: "Create Room", "Join with Code", "Browse Problem Library", "Start Coding Battle", "Subscription Manager".
   - Active Friend List with online presence status and one-click invite to room.
   - Recent room history, solved problems tracker, and "Export Stats to Google Sheets".
3. **Collaborative Room Workspace**:
   - **Header Bar**: Room title, privacy status (Public/Private), room code copy button, member counter (e.g. `2/2 Free` or `4/5 Premium`), subscription upgrade button, and Google Sheets export button.
   - **Collapsible Problem Drawer**: Displays problem statement, constraints, example inputs/outputs, LeetCode link importer with discussion notes.
   - **Monaco Code Editor**: Multi-tab code editor with language selector (JavaScript, TypeScript, Python), syntax highlighting, theme options, real-time collaborative buffer syncing, and snapshot save/restore.
   - **Execution & Test Panel**: Run code against test cases with diff output, execution time, pass/fail status, and custom test input tester.
   - **Side Panels (Tabs)**:
     - *Live Video*: Docked or floating Jitsi Meet video call with camera/mic switches.
     - *Real-time Chat*: Messages, timestamps, sender badges, code snippet sharing with syntax styling, and emoji reactions.
     - *Participants & Permissions*: Room owner controls, kick/invite, member slot status.
4. **LeetCode Problem Importer**:
   - Paste any LeetCode problem URL (e.g. `https://leetcode.com/problems/two-sum/`).
   - Validates URL structure, auto-populates metadata (slug, difficulty, suggested tags), provides "Open on LeetCode" link, and broadcasts the problem to all room peers.
5. **1v1 Coding Battle Mode**:
   - Synchronized lobby with "Ready" state and match countdown (3.. 2.. 1.. GO!).
   - Private side-by-side or split layout where opponent code is hidden; live progress bar shows opponent's passing test cases (e.g. `2/5 tests passed`).
   - Automatic winner detection based on all test cases passed + completion time, leading to Battle Victory / Defeat screen and rating adjustment.
6. **Subscription & UPI QR Payment Workflow**:
   - Room owner tries to increase room size past 2 members (e.g. requesting 4 slots = ₹40/month).
   - Modal renders calculation formula: `max(0, slots - 2) * ₹20/month`.
   - Embeds the uploaded UPI QR image (`ChatGPT Image Oct 14, 2026, 08_39_21 AM.jpg`) with clear instructions to scan with any UPI app (GPay, PhonePe, Paytm).
   - User enters UTR/Transaction ID; status enters "Pending Verification".
   - Room owner / Admin management screen allows reviewing transactions and unlocking member capacity instantly with subscription expiry timer.
7. **Google Workspace Sheets Sync**:
   - One-click Google OAuth connect.
   - Allows users to create a new "CodeTogether Practice Log" or select an existing sheet to append session history, problems solved, code submissions, and battle results.

### Visual Identity & Theme

- **Aesthetic Direction**: High-contrast, dark-mode developer IDE inspired by linear and modern code environments. Dense, uncluttered layout with hairline borders and clear spatial rhythm.
- **Color Palette**:
  - Dominant Canvas (60%): `#090d16` (Deep Obsidian Navy) and `#0f172a` (Slate Navy).
  - Structural Surfaces (30%): `#131d31` (Card surface), `#1e293b` (Elevated borders and dividers `border-slate-800`), `#94a3b8` (Muted secondary text).
  - High-Intent Accents (10%): `#6366f1` (Indigo primary CTA), `#8b5cf6` (Violet brand highlight), `#10b981` (Success / Passed tests), `#ef4444` (Failed test cases / Error).
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` / `Outfit` font for clean geometric structure.
  - Body Prose: `Plus Jakarta Sans` / `DM Sans` at 13px–15px for dense legibility.
  - Code & Telemetry: `JetBrains Mono` / `tabular-nums` for code editing, timers, test case counts, and currency.
- **Responsive Layout**:
  - Desktop: Multi-column IDE workspace with collapsible panels (Problem | Editor + Terminal | Video/Chat).
  - Mobile & Tablet: Tab-switched view (Problem / Code / Chat & Video) with sticky bottom controls complying with the 15% viewport budget.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Execution Model (Sandboxed Web Worker + Judge0 Config)**
  - *Chosen Approach*: Implement an in-browser Web Worker runner with timeouts and sandbox security for JavaScript/TypeScript, while providing a Judge0 API configuration panel for backend multi-language compilation (Python, C++, Java).
  - *Why*: Users get immediate, 0ms latency code verification out-of-the-box without requiring complex external server setups, while retaining production extensibility.
  - *Alternatives Considered*: Server-only container execution would require cloud sandbox infrastructure and credentials that block zero-config evaluation.
- **Decision 2: Monaco Editor with Real-Time Synced Buffer**
  - *Chosen Approach*: Monaco Editor with custom multi-user sync provider, cursor position tracking, syntax highlighting, and snapshot versioning.
  - *Why*: Delivers the genuine VS Code editing experience with IntelliSense, indentation, and keybindings.
- **Decision 3: Jitsi Meet IFrame Integration**
  - *Chosen Approach*: Embed Jitsi Meet via its standard Web IFrame API (`meet.jit.si`) with room-specific hashes, custom interface config (pre-configured audio/video buttons, minimal toolbar), and floating/pinned toggle.
  - *Why*: Standard zero-maintenance, zero-API-key video conferencing that works reliably across browsers without complex WebRTC signalling servers.
- **Decision 4: Google Workspace Sheets Export**
  - *Chosen Approach*: Google OAuth 2.0 with client-side access token flow to invoke Google Sheets API (`v4/spreadsheets`) to log practice data.
  - *Why*: Fulfills the user's specific request using the official Google Workspace integration standards.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CodeTogether Frontend                         │
│                                                                        │
│  ┌────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐ │
│  │ Navigation & Auth  │  │ Dashboard Hub       │  │ Problem Library  │ │
│  │ (Firebase Auth /   │  │ (Stats, Rooms,      │  │ & LeetCode URL   │ │
│  │  Google Sign-In)   │  │  Friends, Sheets)   │  │  Importer        │ │
│  └─────────┬──────────┘  └──────────┬──────────┘  └────────┬─────────┘ │
│            │                        │                      │           │
│  ┌─────────▼────────────────────────▼──────────────────────▼─────────┐ │
│  │                    Active Room Workspace                          │ │
│  │  ┌───────────────────────┐  ┌──────────────────────────────────┐  │ │
│  │  │ Monaco Editor         │  │ Sandboxed Test Runner / Worker   │  │ │
│  │  │ (Realtime Sync & Diff)│  │ (Assertions, Limits, Judge0 API) │  │ │
│  │  └───────────────────────┘  └──────────────────────────────────┘  │ │
│  │  ┌───────────────────────┐  ┌──────────────────────────────────┐  │ │
│  │  │ Jitsi Meet Video Call │  │ Real-Time Live Chat & Reactions  │  │ │
│  │  │ (Floating / Pinned)   │  │ (Code snippets, Emoji tray)      │  │ │
│  │  └───────────────────────┘  └──────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │ Coding Battle Mode (Sync Countdown, Blind Split, Rankings)  │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │ Subscription Modal & UPI QR Payment Verification            │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────┬────────────────────────────────┘ │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────┐
│   Firebase Cloud Firestore   │              │ Google Workspace Sheets  │
│  - users & profiles          │              │  - Session logs export   │
│  - rooms & memberships       │              │  - Battle scores sync    │
│  - chat messages & emojis    │              │  - Solved problem sheet  │
│  - subscriptions & UTR logs  │              └──────────────────────────┘
│  - battle states & rankings  │
└──────────────────────────────┘
```

### Core Entities & Data Stores

1. **User Profile (`users/{userId}`)**:
   - `id`, `name`, `email`, `avatarUrl`, `rating`, `problemsSolved`, `battleWins`, `battleLosses`, `friends: string[]`, `activeRoomId`.
2. **Room (`rooms/{roomId}`)**:
   - `id`, `code` (6-char alphanumeric), `name`, `ownerId`, `isPrivate`, `maxSlots` (default 2), `activeMembers: Member[]`, `currentProblemId`, `codeBuffer`, `language`, `createdAt`.
3. **Room Chat (`rooms/{roomId}/messages/{msgId}`)**:
   - `id`, `senderId`, `senderName`, `senderAvatar`, `text`, `codeSnippet`, `reactions: { emoji: string, users: string[] }[]`, `timestamp`.
4. **Problem Model**:
   - `id`, `title`, `difficulty` ('Easy' | 'Medium' | 'Hard'), `category`, `description`, `examples: { input, output, explanation }[]`, `starterCode: { [lang]: string }`, `testCases: { input, expectedOutput, isHidden }[]`, `leetcodeUrl?`.
5. **Battle Session (`battles/{battleId}`)**:
   - `roomId`, `problemId`, `player1: BattlePlayer`, `player2: BattlePlayer`, `status` ('waiting' | 'countdown' | 'in_progress' | 'finished'), `startTime`, `durationSec`, `winnerId`.
6. **Subscription & Transaction (`subscriptions/{subId}`)**:
   - `roomId`, `ownerId`, `extraSlots`, `totalAmount`, `status` ('free' | 'pending_verification' | 'active' | 'expired'), `utrNumber`, `receiptUrl`, `createdAt`, `expiresAt`.

### Implementation Phases (Execution Turn)

1. **Phase 1: Foundations & Authentication**
   - Initialize project metadata, Google Fonts (`Plus Jakarta Sans`, `JetBrains Mono`), Tailwind color tokens.
   - Configure Firebase Auth & Google Workspace OAuth scopes (`https://www.googleapis.com/auth/spreadsheets`).
   - Implement Auth state management, navigation bar, and user profile store.
2. **Phase 2: Dashboard & Problem Library**
   - Build responsive Dashboard with stats, recent rooms, friend drawer, and problem catalogue.
   - Implement LeetCode URL validator and problem preview card with hints & solution discussion panel.
   - Seed rich built-in problem library (Two Sum, Valid Palindrome, Reverse Linked List, Merge Intervals, Trapping Rain Water, etc.).
3. **Phase 3: Collaborative Coding Workspace & Monaco Editor**
   - Embed Monaco Editor with language switcher, theme toggle, and auto-indent.
   - Implement real-time room synchronization, cursor tracking, and code snapshot saving.
   - Build Sandboxed Web Worker code execution engine with test assertion runner and Judge0 configuration modal.
4. **Phase 4: Jitsi Meet Video & Interactive Chat**
   - Embed Jitsi Meet IFrame with mic/camera toggles and floating/docked layout.
   - Build live chat with message history, code snippet formatting, emoji reaction selector, and moderation report.
5. **Phase 5: Coding Battle Arena (1v1)**
   - Build synchronized battle lobby with ready toggles, 3-2-1 countdown timer, and blind code masking.
   - Live test verification progress bar and victory/defeat results screen.
6. **Phase 6: UPI QR Subscription Billing & Member Slot Enforcer**
   - Dynamic monthly price calculator: `max(0, slots - 2) * ₹20`.
   - Embed the uploaded UPI QR image with scan instructions.
   - Manual payment submission with UTR number, pending verification state, and Admin approval console.
7. **Phase 7: Google Sheets Practice Log Integration**
   - One-click Google Sheets export tool to append room session summaries, test results, and solution code to a user spreadsheet.
8. **Phase 8: Verification & Compilation**
   - Run `compile_applet` and `lint_applet` to ensure error-free compilation and responsive layout.
