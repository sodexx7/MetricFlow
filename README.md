# Front-End Application

A React + TypeScript + Vite application with Web3 integration using RainbowKit and Wagmi.

## Installation and Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone this repository:

   ```bash
   cd front-end
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your configuration:

   - `VITE_PIMLICO_URL`: Your Pimlico service URL
   - `VITE_RPC_URL`: Your RPC endpoint URL

### Running the Application

#### Development Mode

Start the development server:

```bash
npm run dev
```

## Technology Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- RainbowKit (Web3 wallet connection)
- Wagmi (Web3 React hooks)
- Radix UI components
