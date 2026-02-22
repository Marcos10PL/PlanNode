# PlanNode

## Technology Stack

### Frontend/Fullstack

- **Next.js** - The React Framework (16.1.0+)
- **TypeScript** - Typed superset of JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library built on top of Tailwind CSS

- **Zustand** - Lightweight state management library (OPTIONAL)

### Backend/Database

- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)

### Environment Variables

```env

```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
├── app/                    # Główna aplikacja
├── layers/                 # Warstwy Nuxt
│   ├── auth/              # Warstwa autoryzacji
│   ├── base/              # Warstwa bazowa
│   ├── common/            # Warstwa publiczna
│   ├── profile/           # Warstwa profilu użytkownika
│   ├── marketplace/       # Warstwa marketplace
│   └── admin/             # Warstwa administracyjna
├── public/                # Zasoby statyczne
└── server/                # Server-side kod