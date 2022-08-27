# @flowser/frontend

## Usage

Flowser uses `Oswald` and `Days One` font families. You can add them to your web app, adding the following links to your HTML file.
```html
<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Oswald" />
<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Days One" />
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200&display=swap" rel="stylesheet" />
```

Then import the Flowser app root into your app, like so:
```tsx
import React from "react";
import { FlowserClientApp } from "@flowser/frontend";

export function App() {
  return <FlowserClientApp />;
}
```

## Developing

### Automatic tasks

Some automatic tasks are running in the background:

1. ESlint (Run automatically on every commit via Git hooks & Husky)
2. Prettier (Run automatically on every commit via Git hooks & Husky)

Git hooks and Husky setup inspired by the following articles:

-   [Git hooks (Mono repo)](https://scottsauber.com/2021/06/01/using-husky-git-hooks-and-lint-staged-with-nested-folders/)
-   [Git hooks React setup](https://nickymeuleman.netlify.app/blog/git-hooks)
-   [EsLint & Prettier React](https://robertcooper.me/post/using-eslint-and-prettier-in-a-typescript-project)
