# ShareTokenize - Frontend Only

A React-based frontend application for the ShareTokenize platform, demonstrating the UI and user experience for a share tokenization and trading platform.

## Features

- **Modern React Application** with TypeScript
- **Tailwind CSS** for styling with shadcn/ui components
- **Mock Data System** for demonstration purposes
- **Responsive Design** for mobile and desktop
- **Interactive Components** including modals, charts, and forms

## Pages

- **Landing Page** - Marketing and introduction
- **Dashboard** - Portfolio overview and key metrics
- **Market** - Company listings and trading interface
- **Portfolio** - Holdings and tokenized shares management
- **Trading** - Buy/sell tokenized shares
- **Tokenize** - Convert physical shares to tokens
- **Convert** - Convert tokens back to physical shares
- **Wallet** - Fund management and CBDC integration
- **Transactions** - Complete transaction history
- **Settings** - User preferences and account management

## Tech Stack

- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **TanStack Query** for data management
- **Wouter** for routing
- **Lucide React** for icons
- **Chart.js** for data visualization

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type checking

## Mock Data

The application uses mock data to simulate a real backend. All API calls are intercepted and return realistic sample data including:

- Sample NSE companies (Reliance, TCS, HDFC Bank, etc.)
- Demo user profile
- Mock holdings and tokenized shares
- Sample transactions and orders
- Wallet data with CBDC integration

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and configurations
│   └── ui/            # shadcn/ui components
├── index.html
└── ...
```

## Key Components

- **Header** - Navigation and user menu
- **Sidebar** - Main navigation
- **Modals** - Tokenize, Convert, Trading dialogs
- **Charts** - Portfolio and market data visualization
- **Tables** - Data display components
- **Forms** - Input and validation components

## Styling

The application uses Tailwind CSS with a custom color scheme:

- Primary: Blue (#2563eb)
- Secondary: Purple (#7c3aed)
- Warning: Orange (#f59e0b)
- Success: Green (#10b981)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

- All API calls are mocked for demonstration
- Authentication is simulated
- Data is static and resets on page refresh
- Responsive design tested on mobile and desktop
- TypeScript for type safety

## License

MIT License
