# GitHub Copilot project instructions

## Project overview

This is an Astro project that uses React components and TailwindCSS for styling. When making suggestions, please consider the following framework-specific details and conventions.

## Tech stack

- Astro v5.x
- React as UI library
- TailwindCSS for styling (v4.x)
- TypeScript (v5.x) for type safety using the strictest settings
- Playwright for testing
- Terraform for infrastructure management

## Project structure

```
├── .devcontainer/           # Visual Studio Code dev container configuration
├── .github/                 # GitHub Actions workflows and Copilot instructions
├── infra/
│   ├── aws/                 # Terraform scripts for AWS infrastructure
│   └── kubernetes/          # Helm charts for Kubernetes deployments
├── public/                  # Static assets
├── src/
│   ├── components/          # Astor and React components
│   ├── content/             # Markdown content files (blog posts)
│   ├── layouts/             # Astro layout components
│   ├── pages/               # Astro pages and routes
│   └── styles/              # Global styles
├── tests/                   # Test files
│   ├── __screenshots__/     # Playwright screenshots
│   ├── pages/               # Playwright tests for pages
│   ├── navigation.spec.ts/  # Playwright navigation tests
│   └── screenshot.css/      # CSS for Playwright snapshot tests for hiding images
├── .editorconfig            # Editorconfig configuration
├── .eslintignore            # Files and directories to ignore by ESLint
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Git ignore file
├── .node-version            # Defines the Node.js version used in the project
├── .npmrc                   # npm configuration
├── .prettierrc.json         # Prettier configuration used for code formatting
├── astro.config.ts          # Astro configuration
├── playwright.config.ts     # Playwright configuration used for testing
├── postcss.config.cjs       # PostCSS configuration used by TailwindCSS
├── tailwind.config.cjs      # TailwindCSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Project coding conventions

### Component conventions

#### Astro components

- Use `.astro` extension
- Follow PascalCase for filenames
- Example structure:

```astro
---
// Imports and props
type Props = {
    title: string;
};

const { title } = Astro.props;
---

<div class="component-wrapper">
    <h1>{title}</h1>
    <slot />
</div>

<style>
    /* Scoped styles if needed */
</style>
```

#### React components

- Use `.tsx` extension
- Follow PascalCase for component names and files
- Prefer functional components with hooks
- Example structure:

```tsx
import type { FC } from 'react';
import { useState } from 'react';

type ComponentProps = {
    title: string;
};

const MyComponent: FC<ComponentProps> = ({ title }) => {
    const [state, setState] = useState('');

    return (
        <div className="component-wrapper">
            <h1>{title}</h1>
        </div>
    );
};

export { MyComponent };
```

### Styling conventions with TailwindCSS

#### Base guidelines

- Use TailwindCSS utility classes for styling
- Follow mobile-first responsive design
- Use semantic class names when creating components
- Avoid inline styles; use Tailwind classes instead

#### Common utility patterns

```tsx
// Container patterns
'container mx-auto px-4';

// Flex layouts
'flex items-center justify-between';

// Grid layouts
'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

// Typography
'text-base font-medium text-gray-900';

// Interactive elements
'hover:bg-blue-600 transition-colors duration-200';
```

### TypeScript guidelines

- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators

#### Type safety

- Always use TypeScript types for props
- Prefer explicit type annotations over inference
- Use `type` for simple types and `interface` for objects that might be extended

```typescript
interface BaseProps {
    className?: string;
}

interface ButtonProps extends BaseProps {
    variant: 'primary' | 'secondary';
    onClick: () => void;
}
```

### Best practices

#### Astro specific

- Use exclusively static site generation
- Use `.astro` components for pages and layouts
- Use `client:*` directives appropriately for React components

#### React specific

- Keep components small and focused
- Use custom hooks for reusable logic
- Follow React's naming conventions for hooks (use`use` prefix)

#### Performance

- Prefer static routes where possible
- Use image optimization through Astro's built-in support
- Implement lazy loading for heavy components

### Common patterns

#### Layout components

```astro
---
import Header from '@components/layout/Header.astro';
import Footer from '@components/layout/Footer.astro';

type Props = {
    title: string;
};

const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
    <head>
        <title>{title}</title>
    </head>
    <body>
        <Header />

        <main>
            <slot />
        </main>

        <Footer />
    </body>
</html>
```

#### React components with TailwindCSS

```tsx
import type { FC } from 'react';

type CardProps = {
    title: string;
    description: string;
};

const Card: FC<CardProps> = ({ title, description }) => {
    return (
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
            <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

export { Card };
```
