/**
 * Example usage of the Alert notification system
 * 
 * This file demonstrates how to integrate and use the alert system
 * in your React application.
 */

import { AlertProvider } from './context/AlertContext';
import { AlertContainer } from './components/AlertContainer';
import { useAlert } from './hooks/useAlert';

// ============================================
// Step 1: Wrap your app with AlertProvider
// ============================================

function App() {
  return (
    <AlertProvider>
      <YourAppContent />
      <AlertContainer />
    </AlertProvider>
  );
}

// ============================================
// Step 2: Use the useAlert hook in components
// ============================================

function YourAppContent() {
  const { addAlert } = useAlert();

  const handleNetworkError = () => {
    addAlert({
      severity: 'error',
      title: 'Network Anomaly Detected',
      message: 'Unusual traffic pattern identified in port 443',
      duration: 0, // Don't auto-dismiss errors
      action: {
        label: 'View Details',
        onClick: () => {
          console.log('Navigate to details page');
        },
      },
    });
  };

  const handleSuccess = () => {
    addAlert({
      severity: 'success',
      message: 'File uploaded successfully',
      duration: 3000, // Auto-dismiss after 3 seconds
    });
  };

  const handleWarning = () => {
    addAlert({
      severity: 'warning',
      title: 'High CPU Usage',
      message: 'CPU usage has exceeded 80%',
      duration: 5000, // Default 5 seconds
      action: {
        label: 'Dismiss',
        onClick: () => {
          console.log('Warning dismissed');
        },
      },
    });
  };

  const handleInfo = () => {
    addAlert({
      severity: 'info',
      title: 'System Update',
      message: 'New features are available',
    });
  };

  return (
    <div>
      <button onClick={handleNetworkError}>Trigger Error Alert</button>
      <button onClick={handleSuccess}>Trigger Success Alert</button>
      <button onClick={handleWarning}>Trigger Warning Alert</button>
      <button onClick={handleInfo}>Trigger Info Alert</button>
    </div>
  );
}

// ============================================
// Example: Using in API error handling
// ============================================

function ApiExample() {
  const { addAlert } = useAlert();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      
      addAlert({
        severity: 'success',
        message: 'Data loaded successfully',
      });
    } catch (error) {
      addAlert({
        severity: 'error',
        title: 'API Error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 0, // Don't auto-dismiss errors
        action: {
          label: 'Retry',
          onClick: () => fetchData(),
        },
      });
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}

// ============================================
// Example: Using in form validation
// ============================================

function FormExample() {
  const { addAlert } = useAlert();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;

    if (!email || !email.includes('@')) {
      addAlert({
        severity: 'warning',
        message: 'Please enter a valid email address',
        duration: 4000,
      });
      return;
    }

    addAlert({
      severity: 'success',
      message: 'Form submitted successfully',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <button type="submit">Submit</button>
    </form>
  );
}

export default App;

