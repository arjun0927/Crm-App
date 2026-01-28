# CRM Pro - React Native Application

A professional Customer Relationship Management (CRM) mobile application built with React Native.

## 📁 Folder Structure

```
src/
├── assets/                 # Images, icons, and other static assets
│   └── index.js           # Asset exports
│
├── components/            # Reusable UI components
│   ├── AppButton.js       # Customizable button component
│   ├── AppInput.js        # Form input with validation support
│   ├── AppText.js         # Typography component with variants
│   ├── Loader.js          # Loading indicators (multiple variants)
│   ├── ScreenWrapper.js   # Screen container with safe area
│   └── index.js           # Component exports
│
├── constants/             # App-wide constants
│   ├── Colors.js          # Color palette
│   ├── Fonts.js           # Typography system
│   ├── Spacing.js         # Spacing, shadows, border radius
│   └── index.js           # Constants exports + routes, storage keys
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.js         # Authentication state management
│   ├── useDebounce.js     # Value debouncing
│   └── index.js           # Hook exports
│
├── navigation/            # Navigation configuration
│   ├── AppNavigator.js    # Root navigator
│   ├── AuthStack.js       # Auth flow screens
│   ├── BottomTabNavigator.js # Main tab navigation
│   ├── MainStack.js       # Main app stack
│   └── index.js           # Navigation exports
│
├── screens/               # App screens
│   ├── auth/              # Authentication screens
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   └── RegisterScreen.js
│   │
│   ├── main/              # Main tab screens
│   │   ├── DashboardScreen.js
│   │   ├── LeadsScreen.js
│   │   ├── TasksScreen.js
│   │   └── ProfileScreen.js
│   │
│   ├── details/           # Detail & form screens
│   │   ├── LeadDetailsScreen.js
│   │   ├── TaskDetailsScreen.js
│   │   ├── AddLeadScreen.js
│   │   └── AddTaskScreen.js
│   │
│   └── index.js           # Screen exports
│
├── storage/               # Local storage (MMKV)
│   ├── mmkv.js            # MMKV configuration & helpers
│   └── index.js           # Storage exports
│
└── utils/                 # Utility functions
    ├── Responsive.js      # Responsive sizing helpers
    ├── Helpers.js         # Common utility functions
    └── index.js           # Utils exports
```

## 🚀 Features

### Authentication
- Splash screen with auto-login check
- Login with email/password
- Registration with full form validation
- Token-based authentication (frontend mock)
- Persistent login using MMKV storage

### Navigation
- Bottom tab navigation (Dashboard, Leads, Tasks, Profile)
- Stack navigation for detail screens
- Modal presentations for add screens
- Protected routes (auth required)

### Screens
- **Dashboard**: Overview with stats, quick actions, recent leads, pending tasks
- **Leads**: Lead list with search, filtering, and status badges
- **Tasks**: Task list with tabs (Pending/In Progress/Completed)
- **Profile**: User info, settings menu, logout

### UI Components
- `AppButton`: Multiple variants (primary, secondary, outline, ghost, danger)
- `AppInput`: With labels, icons, error handling, password toggle
- `AppText`: Typography with size and weight variants
- `Loader`: Simple, centered, fullscreen, and skeleton variants
- `ScreenWrapper`: Safe area, keyboard avoiding, scroll support

## 📦 Dependencies

- **Navigation**: @react-navigation/native, @react-navigation/bottom-tabs, @react-navigation/native-stack
- **Storage**: react-native-mmkv
- **Icons**: react-native-vector-icons
- **UI**: react-native-safe-area-context, react-native-screens

## 🔧 Setup

1. Install dependencies:
```bash
npm install
```

2. For iOS (macOS only):
```bash
cd ios && pod install && cd ..
```

3. Run the app:
```bash
# Android
npm run android

# iOS
npm run ios
```

## 🔑 Demo Credentials

- **Email**: demo@crm.com
- **Password**: demo123

## 📝 Usage

### Storage Helpers
```javascript
import { setToken, getToken, setUserData, getUserData } from './src/storage';

// Save token
setToken('your-auth-token');

// Get token
const token = getToken();

// Save user data
setUserData({ name: 'John', email: 'john@example.com' });

// Get user data
const user = getUserData();
```

### Responsive Utilities
```javascript
import { wp, hp, ms, fs } from './src/utils';

// Width percentage (42% of screen width)
wp(42)

// Height percentage (10% of screen height)
hp(10)

// Moderate scale (responsive sizing)
ms(16)

// Font scale
fs(14)
```

### Components
```javascript
import { AppButton, AppInput, AppText, ScreenWrapper } from './src/components';

// Button
<AppButton title="Submit" onPress={handleSubmit} variant="primary" />

// Input
<AppInput 
  label="Email" 
  value={email} 
  onChangeText={setEmail}
  leftIcon="email-outline"
  error={!!error}
  errorMessage={error}
/>

// Text
<AppText size="lg" weight="bold" color={Colors.primary}>
  Hello World
</AppText>
```

## 🎨 Customization

### Colors
Edit `src/constants/Colors.js` to customize the color palette.

### Typography
Edit `src/constants/Fonts.js` to customize font sizes and weights.

### Spacing
Edit `src/constants/Spacing.js` to customize spacing, shadows, and border radius.

## 📱 Screens Overview

| Screen | Description |
|--------|-------------|
| Splash | Auto-login check, app branding |
| Login | Email/password authentication |
| Register | New user registration |
| Dashboard | Stats, quick actions, recent items |
| Leads | Lead list with search & filters |
| Tasks | Task list with status tabs |
| Profile | User settings & logout |
| LeadDetails | Lead info & actions |
| TaskDetails | Task info & completion |
| AddLead | Create new lead form |
| AddTask | Create new task form |

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications
- [ ] Offline sync support
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] Export/import data
- [ ] Custom fields for leads
- [ ] Calendar integration

---

Built with ❤️ using React Native
