# Security Policy

Este proyecto está pensado para portfolio y despliegue controlado en VPS.

## Defaults seguros

- No expongas PostgreSQL a internet.
- Mantén `docker compose` con bind `127.0.0.1:5432:5432`.
- No expongas Next.js públicamente hasta configurar dominio, HTTPS y reverse proxy.
- No commitees `.env`, claves API ni PDFs de usuarios.
- Rota `BETTER_AUTH_SECRET` si sospechas filtración.
- Revisa dependencias antes de actualizar Next.js, auth o parser de documentos.

## Uploads

v1 acepta PDF únicamente. Esto reduce superficie mientras LiteParse se integra en el portfolio. Para soportar Office/imagenes, aislar LibreOffice/ImageMagick y definir límites de CPU/memoria.

## Reportar vulnerabilidades

Abre un issue privado o contacta al mantenedor si el repositorio lo permite. Incluye pasos de reproducción y alcance.
