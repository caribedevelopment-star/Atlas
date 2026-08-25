import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    extends: [...nextCoreWebVitals],
    rules: {
        // Atlas carga datos remotos y sincroniza filtros desde efectos. La regla
        // experimental confunde esas sincronizaciones legítimas con estado derivado.
        "react-hooks/set-state-in-effect": "off",
    },
}]);
