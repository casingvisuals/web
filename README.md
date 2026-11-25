# Casing Visuals — Web

Landing page de **Casing Visuals** (HTML + CSS + JS vanilla, sin build). Lista para GitHub Pages.

## Estructura

```
index.html          → home tipo portada: video a pantalla completa + menú
work.html           → trabajos
services.html       → servicios
about.html          → nosotros + creencias + proceso
creators.html       → misión / creadores
contact.html        → formulario de contacto
css/styles.css      → estilos (variables de marca arriba de todo)
js/main.js          → interacciones (menú, reveals, carrusel, contadores)
assets/img/         → fotos de recursos optimizadas (r01–r25.jpg)
assets/logo/        → logo e isotipo en SVG (blanco, navy, violeta)
assets/fonts/       → Sora y Montserrat en woff2
favicon.svg
.nojekyll
```

## Deploy en GitHub Pages

1. Commit + push a `main`.
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, carpeta `/ (root)`.
3. La web queda en `https://casingvisuals.github.io/web/`.
   - Para usar un dominio propio: agregar un archivo `CNAME` con el dominio y configurar el DNS.

## Pendientes (placeholders)

- [ ] Video reel de la home → subir `assets/video/reel.mp4` (y opcional `reel.webm`). Ideal 1920×1080, 15–30 s, < 8 MB. Mientras no exista se ve la imagen poster. Si el video tiene audio, aparece el botón "Sound".
- [ ] Contenido definitivo de cada página interna.
- [ ] Proyectos reales en "Selected work" (imagen, marca, categoría, link).
- [x] Email (info@casingvisuals.com) e Instagram + LinkedIn.
- (assets/img/crossing.jpg queda guardado, sin uso por ahora.)
- [ ] Quitar el bloque "We're hiring" de creators.html cuando cierre la búsqueda.
- [x] Formularios conectados a Formspree (`mjywrare`) — principal y panel rápido. Los mensajes llegan al email de la cuenta de Formspree.

## Paleta y tipografía

| Token     | Valor     |
|-----------|-----------|
| Violet    | `#5D2EED` |
| Navy      | `#242343` |
| Ink (bg)  | `#14132B` |
| Grey      | `#A8A8A8` |

Display: **Sora** · Texto: **Montserrat**
