# Guía de Despliegue (Deployment Guide)

Para compartir tu proyecto en la feria **Inovatec**, vamos a subirlo a internet usando **Vercel**. Es gratis, rápido y perfecto para este tipo de aplicaciones.

## Prerrequisitos

1.  Una cuenta en [Vercel](https://vercel.com/signup) (puedes usar tu GitHub).
2.  Tu proyecto subido a GitHub.

## Pasos para Desplegar

1.  **Inicia sesión en Vercel** y ve a tu Dashboard.
2.  Haz clic en **"Add New..."** -> **"Project"**.
3.  Selecciona tu repositorio de GitHub (`algebra-tutor-ai`).
4.  En la configuración del proyecto ("Configure Project"):
    *   **Framework Preset**: Vite (debería detectarse automáticamente).
    *   **Root Directory**: `./` (déjalo como está).
    *   **Environment Variables**: ¡Esto es importante!
        *   Haz clic en "Environment Variables".
        *   **Key**: `VITE_API_KEY`
        *   **Value**: Tu clave de API de Google Gemini (la misma que está en tu archivo `.env.local`).
5.  Haz clic en **"Deploy"**.

## ¡Listo!

Vercel construirá tu aplicación y te dará una URL pública (ej. `algebra-tutor-ai.vercel.app`).

1.  Abre esa URL en tu navegador.
2.  Haz clic en el botón **"COMPARTIR"** en la pantalla de inicio.
3.  ¡Aparecerá un código QR que los jueces y visitantes pueden escanear para probar tu app!

## Solución de Problemas

*   **Error 404 / Pantalla en blanco**: Asegúrate de que la variable de entorno `VITE_API_KEY` esté configurada correctamente en Vercel.
*   **Permisos de Micrófono/Cámara**: La primera vez que alguien entre, el navegador pedirá permisos. Asegúrate de que el sitio tenga HTTPS (Vercel lo pone automático).
