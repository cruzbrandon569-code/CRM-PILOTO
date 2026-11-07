# Checklist: pasar el proyecto a la máquina nueva

Todo lo importante vive fuera de la computadora:

| Qué | Dónde vive |
|---|---|
| Código, migraciones, documentación y (después) la skill | GitHub: `cruzbrandon569-code/CRM-PILOTO` |
| Datos del CRM | Supabase (nube) |
| Llaves (`.env.local`) | Tu gestor de contraseñas. **Nunca en GitHub** |

## Antes de dejar la máquina actual
- [ ] `git status` limpio y `git push` hecho
- [ ] Contenido de `.env.local` guardado en el gestor de contraseñas
- [ ] Si se creó la skill fuera del repo (`~/.claude/skills/`), copiarla al repo y subirla

## En la máquina nueva (unos 30 minutos)
1. Instalar [Git](https://git-scm.com), [Node.js LTS](https://nodejs.org) y Claude Code.
2. Clonar dentro de la carpeta de proyectos (`Descargas\Cloude`), sin usar la raíz del disco C:
   ```powershell
   git clone https://github.com/cruzbrandon569-code/CRM-PILOTO.git "$env:USERPROFILE\Downloads\Cloude\CRM-PILOTO"
   ```
3. Instalar dependencias (incluye la CLI de Supabase):
   ```bash
   npm install
   ```
4. Crear `.env.local` con los valores guardados (ver `.env.example`).
5. Conectar la CLI de Supabase, solo si vas a aplicar migraciones:
   ```bash
   npx supabase login
   ```
   ```bash
   npx supabase link --project-ref TU_PROJECT_REF
   ```
6. Probar:
   ```bash
   npm run dev
   ```
