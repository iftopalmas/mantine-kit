/* Allows importing CSS Modules (e.g. `import classes from './Navbar.module.css'`), which Vite compiles in the build. */
declare module '*.module.css' {
    const classes: Readonly<Record<string, string>>;
    export default classes;
}

declare module '*.css';
