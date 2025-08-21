import type { Config } from "tailwindcss";

export default {
    content: [
        "./index.html",
        "./*.{ts,tsx,js,jsx}",        // <-- root-level files (main.tsx, App.tsx, etc.)
        "./src/**/*.{ts,tsx,js,jsx}", // <-- anything under src/
    ],
    theme: { extend: {} },
    plugins: [],
} satisfies Config;
