# Ciclo de CI/CD en Node.js: Hasta la Construcción del Paquete

## Introducción

El CI/CD automatiza la integración, pruebas y empaquetado de aplicaciones Node.js. Este documento cubre el ciclo hasta la construcción del paquete, incluyendo Docker para entornos consistentes.

## ¿Qué es CI/CD?

- **CI**: Integra cambios de código automáticamente, ejecuta pruebas y verifica calidad.
- **CD**: Automatiza la entrega del software hasta el empaquetado.

Pasos del ciclo:

1. Push de código.
2. Build de la app.
3. Ejecución de tests.
4. Creación de paquetes (NPM y Docker).
5. Despliegue (opcional).

## Integración con Docker

Docker proporciona entornos consistentes para desarrollo, CI y producción, facilitando el aislamiento, escalabilidad y rapidez en los procesos.

## Estructura del Proyecto

```
.
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── coverage/
├── node_modules/
├── Dockerfile
├── index.js
├── index.test.js
├── jest.config.js
├── package.json
└── README.md
```

### Archivos Necesarios

- `package.json`: Configuración del proyecto Node.js con dependencias y scripts.
- `babel.config.js`: Configuración de Babel para Jest con ES modules.
- `index.js`: Código principal de la aplicación.
- `index.test.js`: Pruebas unitarias con Jest.
- `jest.config.js`: Configuración de Jest.
- `Dockerfile`: Instrucciones para construir la imagen Docker.
- `.github/workflows/ci-cd.yml`: Workflow de GitHub Actions para CI/CD.

## Configuración del Entorno

Para este ejemplo, asumimos un proyecto Node.js básico. El `package.json` incluye scripts para pruebas y construcción.

### Dependencias Necesarias

Instala las dependencias para pruebas:

```bash
npm install --save-dev jest
```

Actualiza el `package.json` para incluir scripts de prueba:

### Dockerfile

Crea un `Dockerfile` para empaquetar la aplicación:

```dockerfile
# Usa una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm ci --only=production

# Copia el resto del código
COPY . .

# Expone el puerto (ajusta según tu aplicación)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
```

Este Dockerfile crea una imagen ligera basada en Alpine Linux, instala solo dependencias de producción, y configura la aplicación para ejecutarse.

```json
{
  "name": "git-hub-actions",
  "version": "1.0.0",
  "description": "Ejemplo de CI/CD en Node.js",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "jest",
    "build": "npm run test && echo 'Build completado'",
    "package": "npm pack"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

## Ejemplo Práctico: Implementación con GitHub Actions

Usaremos GitHub Actions para automatizar el ciclo CI/CD. Crea el archivo `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Create package
        run: npm run package

      - name: Upload package artifact
        uses: actions/upload-artifact@v3
        with:
          name: node-package-${{ matrix.node-version }}
          path: git-hub-actions-*.tgz

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/git-hub-actions:${{ github.sha }},${{ secrets.DOCKER_USERNAME }}/git-hub-actions:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Explicación del Workflow

El workflow se activa en push/PR a `main`, prueba en Node.js 16.x, 18.x, 20.x. Pasos: checkout, setup Node.js, instalar deps, tests, build, crear paquete NPM, subir artifact, setup Docker, login a Docker Hub, build y push imagen Docker.

## Ejemplos de Pruebas en Node.js

### Configuración de Babel

Crea un archivo `babel.config.js` para Jest con ES modules:

```javascript
export default {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ],
};
```

### Configuración de Jest

Crea un archivo `jest.config.js`:

```javascript
export default {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
```

### Archivo Principal: index.js

```javascript
export function suma(a, b) {
  return a + b;
}

export function resta(a, b) {
  return a - b;
}
```

### Archivo de Pruebas: index.test.js

```javascript
import { suma, resta } from "./index.js";

describe("Operaciones matemáticas", () => {
  test("suma de 1 + 2 debe ser 3", () => {
    expect(suma(1, 2)).toBe(3);
  });

  test("resta de 5 - 3 debe ser 2", () => {
    expect(resta(5, 3)).toBe(2);
  });

  test("suma con números negativos", () => {
    expect(suma(-1, -2)).toBe(-3);
  });

  test("resta resultando en negativo", () => {
    expect(resta(2, 5)).toBe(-3);
  });
});
```

### Ejecución de Pruebas

Ejecuta las pruebas localmente:

```bash
npm test
```

Esto ejecutará Jest y mostrará los resultados. Con la configuración de cobertura, también generará reportes en la carpeta `coverage`.

## Construcción del Paquete

Después de tests, el workflow crea:

### Paquete NPM

- `npm pack` genera un `.tgz` con el código empaquetado.
- Verificar con `npm pack --dry-run`.

### Imagen Docker

- Build y push a GitHub Container Registry (ghcr.io) con tags SHA y latest.
- Local: `docker build -t ghcr.io/[tu-usuario]/[tu-repo]/git-hub-actions .` y `docker run -p 3000:3000 ghcr.io/[tu-usuario]/[tu-repo]/git-hub-actions`.

## Beneficios de este Ciclo CI/CD

- **Automatización**: Reduce errores humanos en procesos repetitivos.
- **Rapidez**: Feedback inmediato sobre cambios.
- **Calidad**: Pruebas automatizadas aseguran funcionalidad.
- **Consistencia**: Entornos controlados en CI.
- **Escalabilidad**: Fácil de extender para despliegue.

## Conclusión

Este setup automatiza CI/CD para Node.js con Docker. Las imágenes se publican en GitHub Container Registry (ghcr.io). Extiende con linting, security scans o despliegue para producción.
