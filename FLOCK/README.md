# FLOCK

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Запуск приложения

Для локальной разработки используйте:

```bash
ng serve
```

Если вы используете SSR, убедитесь, что сервер запускается командой:

```bash
npm run serve:ssr:FLOCK
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Troubleshooting ng serve

If you encounter issues running `ng serve`, try the following steps:

- Ensure you have installed all dependencies:  
  ```bash
  npm install
  ```
- Make sure you are using a supported Node.js version (check `.nvmrc` or `package.json` engines if present).
- If you see errors related to ports, make sure port 4200 is free or specify another port:  
  ```bash
  ng serve --port 4300
  ```
- Delete `node_modules` and reinstall dependencies if errors persist:  
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- If you get Angular CLI errors, try updating/reinstalling Angular CLI globally:  
  ```bash
  npm install -g @angular/cli
  ```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
