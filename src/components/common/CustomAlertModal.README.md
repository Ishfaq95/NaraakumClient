# Custom Alert Modal

A reusable, customizable alert modal component for React Native that replaces the native Alert.

## Features

- ✅ Custom styled modal with RTL support (Arabic)
- ✅ Multiple alert types (info, success, warning, error)
- ✅ Configurable buttons (single confirm or confirm + cancel)
- ✅ Global access via AlertContext
- ✅ Beautiful UI with icons and animations
- ✅ TypeScript support

## Usage

### 1. Using the Alert Hook (Recommended)

```tsx
import { useAlert } from '../../contexts/AlertContext';

const MyComponent = () => {
  const { showAlert } = useAlert();

  const handleAction = () => {
    showAlert({
      title: 'نجاح',
      message: 'تم إتمام العملية بنجاح',
      type: 'success',
      confirmText: 'موافق',
    });
  };

  return (
    <TouchableOpacity onPress={handleAction}>
      <Text>اضغط هنا</Text>
    </TouchableOpacity>
  );
};
```

### 2. With Confirmation Action

```tsx
const handleDelete = () => {
  showAlert({
    title: 'تأكيد الحذف',
    message: 'هل أنت متأكد من حذف هذا العنصر؟',
    type: 'warning',
    showCancelButton: true,
    confirmText: 'حذف',
    cancelText: 'إلغاء',
    onConfirm: () => {
      // Perform delete action
      console.log('Item deleted');
    },
  });
};
```

### 3. Error Alert

```tsx
const handleError = () => {
  showAlert({
    title: 'خطأ',
    message: 'حدث خطأ أثناء معالجة طلبك',
    type: 'error',
    confirmText: 'حسناً',
  });
};
```

### 4. Info Alert (Notification)

```tsx
const handleNotification = () => {
  showAlert({
    title: 'إشعار جديد',
    message: 'لديك موعد جديد اليوم الساعة 3:00 مساءً',
    type: 'info',
    confirmText: 'عرض التفاصيل',
    onConfirm: () => {
      navigation.navigate('AppointmentDetails');
    },
  });
};
```

## API Reference

### showAlert(config)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | No | - | Alert title |
| `message` | string | Yes | - | Alert message body |
| `type` | 'info' \| 'success' \| 'warning' \| 'error' | No | 'info' | Alert type (affects icon and color) |
| `confirmText` | string | No | 'موافق' | Confirm button text |
| `cancelText` | string | No | 'إلغاء' | Cancel button text |
| `showCancelButton` | boolean | No | false | Show cancel button |
| `onConfirm` | () => void | No | - | Callback when confirm is pressed |

### Alert Types

- **info**: Blue info icon
- **success**: Green check icon
- **warning**: Yellow warning icon
- **error**: Red error icon

## Example in NotificationConfig.tsx

```tsx
// Instead of:
Alert.alert(title, body);

// Use:
showAlert({
  title: title || 'إشعار',
  message: body || '',
  type: 'info',
  confirmText: 'موافق',
});
```

## Styling

The component uses the Cairo font family and follows the app's design system. To customize styles, edit `CustomAlertModal.tsx`.

## Notes

- The AlertProvider is already set up in `App.tsx`
- The modal is rendered at the top level, so it appears above all other content
- The modal is dismissible by pressing the close button or tapping outside (if configured)

