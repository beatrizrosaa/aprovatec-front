# Aprovatec Frontend

A modern React application built with TypeScript, Vite, and Tailwind CSS for managing academic semesters and approvals.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.x or higher recommended)
- **npm** (comes with Node.js) or **yarn**

You can check if you have Node.js installed by running:
```bash
node --version
npm --version
```

## Installation

1. Clone the repository (if applicable) or navigate to the project directory:
```bash
cd aprovatec-front
```

2. Install the project dependencies:
```bash
npm install
```

This will install all the required dependencies listed in `package.json`.

## Configuration

The application connects to a backend API. By default, it uses `http://localhost:3000` as the API URL. 

To configure a different API URL, create a `.env` file in the root directory:

```bash
VITE_API_URL=http://localhost:3000
```

Replace `http://localhost:3000` with your backend API URL.

**Note:** Make sure your backend API is running and accessible at the configured URL.

## Running the Development Server

To start the development server:

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port). Open your browser and navigate to this URL to view the application.

The dev server includes:
- Hot Module Replacement (HMR) for instant updates
- Fast refresh for React components
- TypeScript type checking

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized production build in the `dist` directory.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This serves the production build locally for testing before deployment.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Project Structure

```
aprovatec-front/
├── src/
│   ├── components/      # Reusable React components
│   ├── context/         # React context providers (Auth, Theme)
│   ├── pages/           # Page components
│   ├── services/        # API service functions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.cjs  # Tailwind CSS configuration
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. You can also specify a different port:

```bash
npm run dev -- --port 3001
```

### API Connection Issues

- Ensure your backend API server is running
- Verify the API URL in your `.env` file (or check the default `http://localhost:3000`)
- Check browser console for CORS or connection errors

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Review TypeScript errors in the terminal output

## Deployment on Vercel

This project is configured and ready to be deployed on Vercel.

### Prerequisites

1. A Vercel account ([sign up](https://vercel.com/signup) if you don't have one)
2. Your backend API URL for production

### Deployment Steps

1. **Connect your repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository

2. **Configure environment variables:**
   - In the project settings, go to "Environment Variables"
   - Add the following variable:
     - **Name:** `VITE_API_URL`
     - **Value:** Your production backend API URL (e.g., `https://your-backend.vercel.app` or `https://api.yourdomain.com`)
   - Make sure to add it for all environments (Production, Preview, Development)

3. **Deploy:**
   - Vercel will automatically detect this as a Vite project
   - It will use the build command: `npm run build`
   - Output directory: `dist`
   - The `vercel.json` file ensures proper SPA routing

### Important Notes

- **CORS Configuration:** Make sure your backend API is configured to accept requests from your Vercel domain
- **Environment Variables:** The `VITE_API_URL` variable must be set in Vercel's dashboard, not in a `.env` file (which is gitignored)
- **Automatic Deployments:** Vercel will automatically deploy on every push to your main branch

### Manual Deployment (Alternative)

If you prefer using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to configure your project
```

## License

This project is private.

