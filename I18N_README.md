# Internationalization (i18n) Setup Guide

This project uses `next-intl` for internationalization, which is the recommended solution for Next.js 13+ with App Router.

## Project Structure

```
├── messages/
│   ├── en.json          # English translations
│   └── ur.json          # Urdu translations
├── app/
│   ├── [locale]/        # Locale-based routing
│   │   ├── layout.tsx   # Locale-specific layout
│   │   └── page.tsx     # Main page
│   └── layout.tsx       # Root layout
├── components/
│   └── LanguageSwitcher.tsx  # Language switching component
├── hooks/
│   └── useTranslations.ts    # Translation hooks
├── i18n.ts              # i18n configuration
├── middleware.ts         # Locale routing middleware
└── next-i18next.config.js    # Legacy config (can be removed)
```

## Supported Languages

- **English (en)** - Default language
- **Urdu (ur)** - Right-to-left (RTL) language support

## How to Use

### 1. Basic Translation Usage

```tsx
import { useCommonTranslations } from "@/hooks/useTranslations";

function MyComponent() {
  const t = useCommonTranslations();

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <button>{t("submit")}</button>
    </div>
  );
}
```

### 2. Using Different Namespaces

```tsx
import {
  useAuthTranslations,
  useChatTranslations,
} from "@/hooks/useTranslations";

function AuthComponent() {
  const authT = useAuthTranslations();
  const chatT = useChatTranslations();

  return (
    <div>
      <h2>{authT("login_title")}</h2>
      <p>{chatT("new_message")}</p>
    </div>
  );
}
```

### 3. Language Switching

The `LanguageSwitcher` component is available for switching between languages:

```tsx
import LanguageSwitcher from "@/components/LanguageSwitcher";

function Navbar() {
  return (
    <nav>
      <LanguageSwitcher />
      {/* Other navbar items */}
    </nav>
  );
}
```

### 4. URL Structure

- English: `/en/...`
- Urdu: `/ur/...`
- Root `/` redirects to `/en`

## Adding New Languages

### 1. Create Translation File

Create a new file in `messages/` directory (e.g., `messages/fr.json`):

```json
{
  "common": {
    "login": "Connexion",
    "signup": "S'inscrire",
    "name": "Nom",
    "email": "E-mail",
    "password": "Mot de passe"
  }
}
```

### 2. Update Configuration

Add the new locale to `i18n.ts`:

```typescript
export const locales = ["en", "ur", "fr"] as const;
```

### 3. Update Middleware

The middleware will automatically handle the new locale.

## Translation File Structure

Each language file follows this structure:

```json
{
  "common": {
    "login": "Login",
    "signup": "Sign Up"
  },
  "auth": {
    "login_title": "Welcome Back",
    "login_subtitle": "Sign in to your account"
  },
  "chat": {
    "new_message": "New Message",
    "send": "Send"
  },
  "navigation": {
    "home": "Home",
    "profile": "Profile"
  }
}
```

## Best Practices

1. **Use namespaces** to organize translations logically
2. **Keep keys descriptive** and consistent across languages
3. **Use the translation hooks** instead of direct imports
4. **Test RTL languages** like Urdu for proper layout
5. **Consider pluralization** for different languages if needed

## RTL Language Support

For Urdu (RTL language), the layout automatically adjusts. You can add RTL-specific styles:

```css
[dir="rtl"] {
  /* RTL-specific styles */
  text-align: right;
}
```

## Troubleshooting

### Common Issues

1. **Translations not loading**: Check that the locale is in the `locales` array
2. **404 errors**: Ensure middleware is properly configured
3. **Missing translations**: Verify the translation key exists in all language files

### Development

- Run `npm run dev` to start the development server
- Navigate to `/en` or `/ur` to test different languages
- Use the language switcher to test language switching

## Migration from react-i18next

If you were previously using `react-i18next`, replace:

```tsx
// Old
import { useTranslation } from "react-i18next";
const { t } = useTranslation("namespace");

// New
import { useTranslations } from "@/hooks/useTranslations";
const t = useTranslations("namespace");
```

## Additional Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [RTL Layout Support](https://nextjs.org/docs/app/building-your-application/routing/internationalization#right-to-left-rtl-layouts)
