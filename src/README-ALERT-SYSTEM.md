# Alert Notification System

A comprehensive, accessible notification system for React 18 + TypeScript applications with Context API state management.

## Features

- ✅ **WCAG 2.1 AA Compliant** - Full accessibility support
- 🎨 **4 Severity Levels** - info, warning, error, success
- ⏱️ **Auto-dismiss** - Configurable duration (default 5s, disabled for errors)
- 📊 **Progress Bar** - Visual countdown for auto-dismissing alerts
- 🎯 **Action Buttons** - Optional action buttons (e.g., "Retry", "Undo")
- 🚫 **Duplicate Prevention** - Prevents duplicate alerts within 3 seconds
- 📱 **Responsive** - Mobile-friendly design
- 🎭 **Animations** - Smooth fade-in/fade-out transitions
- 📦 **Stack Management** - Max 5 visible alerts (FIFO removal)

## Installation

The alert system is already set up in your project. Just import and use!

## Quick Start

### 1. Wrap your app with AlertProvider

```tsx
import { AlertProvider } from './context/AlertContext';
import { AlertContainer } from './components/AlertContainer';

function App() {
  return (
    <AlertProvider>
      <YourAppContent />
      <AlertContainer />
    </AlertProvider>
  );
}
```

### 2. Use the hook in your components

```tsx
import { useAlert } from './hooks/useAlert';

function MyComponent() {
  const { addAlert } = useAlert();

  const handleError = () => {
    addAlert({
      severity: 'error',
      title: 'Network Anomaly Detected',
      message: 'Unusual traffic pattern identified in port 443',
      duration: 0, // Don't auto-dismiss
      action: {
        label: 'View Details',
        onClick: () => {
          // Navigate to details
        },
      },
    });
  };

  return <button onClick={handleError}>Trigger Alert</button>;
}
```

## API Reference

### `useAlert()` Hook

Returns an object with the following methods:

#### `addAlert(options: AddAlertOptions)`

Adds a new alert to the notification stack.

**Options:**
- `severity: 'info' | 'warning' | 'error' | 'success'` (required)
- `message: string` (required)
- `title?: string` (optional)
- `duration?: number` (optional, milliseconds, default: 5000, 0 = no auto-dismiss)
- `action?: { label: string; onClick: () => void }` (optional)

#### `removeAlert(id: string)`

Removes a specific alert by ID.

#### `clearAll()`

Removes all active alerts.

## Examples

### Basic Usage

```tsx
const { addAlert } = useAlert();

// Simple success message
addAlert({
  severity: 'success',
  message: 'Operation completed successfully',
});

// Error with action button
addAlert({
  severity: 'error',
  title: 'Upload Failed',
  message: 'File could not be uploaded',
  duration: 0, // Don't auto-dismiss errors
  action: {
    label: 'Retry',
    onClick: () => retryUpload(),
  },
});

// Warning with custom duration
addAlert({
  severity: 'warning',
  title: 'High CPU Usage',
  message: 'CPU usage has exceeded 80%',
  duration: 10000, // 10 seconds
});
```

### API Error Handling

```tsx
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed to fetch');
    
    addAlert({
      severity: 'success',
      message: 'Data loaded successfully',
    });
  } catch (error) {
    addAlert({
      severity: 'error',
      title: 'API Error',
      message: error.message,
      duration: 0,
      action: {
        label: 'Retry',
        onClick: () => fetchData(),
      },
    });
  }
};
```

### Form Validation

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const email = e.target.email.value;

  if (!email || !email.includes('@')) {
    addAlert({
      severity: 'warning',
      message: 'Please enter a valid email address',
    });
    return;
  }

  addAlert({
    severity: 'success',
    message: 'Form submitted successfully',
  });
};
```

## Configuration

### Constants (in `src/types/alert.types.ts`)

- `DEFAULT_ALERT_DURATION = 5000` - Default auto-dismiss time (5 seconds)
- `MAX_VISIBLE_ALERTS = 5` - Maximum number of visible alerts
- `DUPLICATE_DETECTION_WINDOW = 3000` - Duplicate detection window (3 seconds)

### Styling

The alert system uses CSS custom properties for theming. You can override colors in `src/components/Alert.css`:

```css
.alert {
  --color-info: #3b82f6;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-success: #10b981;
}
```

## Accessibility Features

- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ High contrast mode support
- ✅ Reduced motion support
- ✅ Screen reader announcements (`aria-live`)

## Behavior

### Auto-dismiss
- Default duration: 5 seconds
- Errors: Never auto-dismiss (duration: 0)
- Progress bar shows remaining time

### Stack Management
- Maximum 5 visible alerts
- FIFO (First In, First Out) removal when max reached
- New alerts appear at the bottom

### Duplicate Prevention
- Prevents duplicate alerts (same severity + message) within 3 seconds
- Based on severity and message content

## File Structure

```
src/
├── types/
│   └── alert.types.ts          # TypeScript types and interfaces
├── context/
│   └── AlertContext.tsx        # Context and Provider
├── components/
│   ├── Alert.tsx               # Individual alert component
│   ├── Alert.css               # Alert styles
│   ├── AlertContainer.tsx      # Container component
│   └── AlertContainer.css      # Container styles
├── hooks/
│   └── useAlert.ts             # Custom hook
└── example-usage.tsx            # Usage examples
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- Optimized rendering with React hooks
- Efficient timer management
- Minimal re-renders
- CSS animations (GPU accelerated)

## License

Part of your project codebase.

