# Tutor de Álgebra con IA "Chip" (Versión para Despliegue Web)

¡Hola! Bienvenido a tu tutor de Álgebra IA. Esta versión está optimizada para ser desplegada fácilmente en la web, ideal para compartir en eventos como ferias de proyectos.

---

## 🏛️ Arquitectura Simplificada (Solo Frontend)

Para facilitar el despliegue y la portabilidad, esta aplicación funciona **100% en el navegador del cliente**:

*   **Framework**: Construida con **React** y **Vite**.
*   **Estilos**: **Tailwind CSS** para una interfaz moderna y adaptable.
*   **Inteligencia Artificial**: Se comunica directamente con la **API de Google Gemini** a través del SDK `@google/genai`.
*   **Interacción por Voz**: Utiliza la **API Live de Gemini** para una conversación de voz fluida y en tiempo real, incluyendo transcripción.
*   **Persistencia**: Guarda el historial de chat y el progreso del estudiante en el **LocalStorage** del navegador, permitiendo reanudar sesiones.

**Ventaja Principal**: Al no requerir un backend separado, puedes desplegar esta aplicación en servicios de hosting estático gratuitos como Vercel o Netlify con una configuración mínima.

---

## 🚀 Cómo Desplegar para tu Feria de Proyectos (Recomendado)

Sigue estos pasos para tener tu aplicación en línea con una URL pública que puedes compartir mediante un código QR. Usaremos **Vercel** por su simplicidad.

### Paso 1: Sube tu Código a GitHub

Asegúrate de que todo tu código (especialmente el contenido de la carpeta `frontend`) esté en un repositorio de GitHub.

### Paso 2: Despliega en Vercel

1.  **Crea una cuenta en Vercel**: Ve a [vercel.com](https://vercel.com) y regístrate usando tu cuenta de GitHub. Es gratis.
2.  **Importa tu Proyecto**:
    *   En tu panel de Vercel, haz clic en **"Add New..." -> "Project"**.
    *   Busca y selecciona tu repositorio de GitHub.
3.  **Configura el Proyecto (¡Paso Crucial!)**:
    *   Vercel debería detectar automáticamente que usas **Vite**.
    *   Busca la opción que dice **"Root Directory"**. Si tu código está dentro de una carpeta (ej. `frontend`), haz clic en "Edit" y selecciona esa carpeta. Si el `package.json` principal está en la raíz, no necesitas cambiar nada.
    *   Ve a la sección **"Environment Variables"** (Variables de Entorno). Aquí pondrás tu clave de API de forma segura:
        *   **Name**: `VITE_API_KEY`
        *   **Value**: Pega tu clave de API de Google Gemini aquí.
    *   Haz clic en **"Add"**.
4.  **Despliega**:
    *   Haz clic en el botón **"Deploy"**.
    *   Vercel construirá tu aplicación y en unos minutos te dará una **URL pública** (ej. `mi-tutor-ia.vercel.app`).

### Paso 3: Crea tu Código QR

1.  Copia la URL pública que te dio Vercel.
2.  Ve a un generador de QR gratuito como [QR Code Generator](https://www.the-qrcode-generator.com/).
3.  Pega tu URL y descarga la imagen del QR.
4.  ¡Listo! Imprime el QR y ponlo en tu stand. Cualquiera podrá escanearlo y usar tu tutor de IA en su propio teléfono.

---

## 💻 Ejecución Local (Para Desarrollo)

Si prefieres ejecutarlo en tu máquina para hacer cambios:

1.  **Navega a la carpeta del proyecto** (ej. `frontend` si aplica).
2.  **Crea un archivo `.env`**: En la raíz de tu proyecto frontend, crea un archivo llamado `.env`.
3.  **Añade tu API Key**: Abre el archivo `.env` y añade la siguiente línea, reemplazando `TU_API_KEY_AQUI` con tu clave real:
    ```
    VITE_API_KEY=TU_API_KEY_AQUI
    ```
4.  **Instala las dependencias** (solo la primera vez):
    ```bash
    npm install
    ```
5.  **Inicia el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
6.  Abre tu navegador y ve a la dirección que te indica la terminal (normalmente `http://localhost:5173`).
