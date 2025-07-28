# Student Hub - React Frontend

This is the React frontend for the Student Hub application, built with Create React App and Material-UI.

## Tech Stack

- **React 18+** - Frontend framework
- **Material-UI (MUI)** - Component library and styling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Charts and data visualization
- **Emotion** - CSS-in-JS styling engine

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components for routing
├── context/       # React Context providers
├── hooks/         # Custom React hooks
├── services/      # API service functions
├── utils/         # Helper functions and constants
├── theme.js       # Material-UI theme configuration
└── App.js         # Main App component
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm 8+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Features

- 🎨 **Material-UI Design System** - Consistent and professional UI
- 🌈 **Custom Theme** - Tailored color palette and typography
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 🔐 **Authentication Context** - Global auth state management
- 🛠 **Development Ready** - Hot reloading and error boundaries

## Environment Variables

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_APP_NAME=Student Hub
REACT_APP_VERSION=1.1
```

## Next Steps

1. Create page components (Login, Dashboard, Chat, etc.)
2. Implement routing with React Router
3. Build reusable UI components
4. Add state management for posts and chats
5. Integrate with backend API
6. Add real-time chat functionality

## Contributing

This is part of the Student Hub monorepo. See the main README for contribution guidelines.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
