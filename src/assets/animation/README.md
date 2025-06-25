# Lottie Animations

This directory contains Lottie animation files and utilities for the Naraakum Client app.

## Available Animations

- `joining_lottie.json` - Animation for joining/loading states
- `recording_lottie.json` - Animation for recording states

## Usage Examples

### Basic Usage
```tsx
import LottieAnimation from '../common/LottieAnimation';
import { LOTTIE_ANIMATIONS } from '../../assets/animation';

<LottieAnimation
  source={LOTTIE_ANIMATIONS.JOINING}
  style={{ width: 100, height: 100 }}
  autoPlay
  loop
/>
```

### Success Animation
```tsx
<LottieAnimation
  source={LOTTIE_ANIMATIONS.JOINING}
  style={styles.successAnimation}
  autoPlay
  loop={false} // Play once for success
  onAnimationFinish={() => console.log('Animation finished')}
/>
```

### Loading Animation
```tsx
<LottieAnimation
  source={LOTTIE_ANIMATIONS.JOINING}
  style={styles.loadingAnimation}
  autoPlay
  loop
  speed={1.5} // Faster animation
/>
```

### Recording Animation
```tsx
<LottieAnimation
  source={LOTTIE_ANIMATIONS.RECORDING}
  style={styles.recordingAnimation}
  autoPlay
  loop
/>
```

## Props

- `source`: Lottie animation file (required)
- `style`: Container style (optional)
- `autoPlay`: Start animation automatically (default: true)
- `loop`: Repeat animation (default: true)
- `speed`: Animation speed multiplier (default: 1)
- `onAnimationFinish`: Callback when animation completes (optional)

## Adding New Animations

1. Add your `.json` file to this directory
2. Update `index.ts` to export the new animation
3. Use it in your components

## Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web (with additional setup) 