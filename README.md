# Fortress ASR Frontend Dashboard & Client Portal

This is the Next.js frontend application for the **Fortress ASR Security Operations Management System (SOMS)**. It hosts the administrative control panel, supervisor rota scheduler, and the secure read-only client visibility portal.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom thematic configuration (`tailwind.config.ts`)
- **State Management**: **Zustand** (global, lightweight, multi-store architecture)
- **Iconography**: Lucide React

## Folder Structure

- `src/app/`: File-based layout and routing hierarchy.
  - `/auth/login/`: Unified secure credentials entrance.
  - `/admin/dashboard/`: Control room dashboard for high-level administration.
  - `/supervisor/rota/`: Drag-and-drop rota and shift assignment panel.
  - `/client/[clientSlug]/dashboard/`: Strict route-isolated properties tracker for client contracts.
- `src/components/ui/`: Atomic, reusable high-fidelity components (e.g., `Button`, `Card`, `Input`).
- `src/store/`: Unified state management stores:
  - `useAuthStore.ts`: Tracks verified sessions, active profiles, and roles.
  - `useUIStore.ts`: Tracks sidebar toggle, theme layouts, and active counters.
- `src/services/api.ts`: API integration layer matching backend route contracts.

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
