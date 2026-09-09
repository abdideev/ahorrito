# GITFLOW.md — Guía de Git Flow para Ahorrito

Versión reducida de Git Flow, adaptada a un desarrollador único. Se usan tres tipos de rama:
`main`, `dev` y `feature/*`. No se usan ramas `release` ni `hotfix`, porque con un solo
responsable y sin operación posterior a la entrega no aportan nada y sí añaden ceremonia.

---

## 1. Modelo de ramas

| Rama | Nace de | Se integra a | Contenido |
|---|---|---|---|
| `main` | — | — | Solo versiones liberadas y probadas. Protegida |
| `dev` | `main` | `main` | Integración continua de funcionalidades terminadas |
| `feature/*` | `dev` | `dev` | Una funcionalidad en construcción |

```
main     ●────────────────────────────●──────────────●
          \                          /              /
dev        ●────●────────●────●─────●──────●───────●
                 \      /      \         /
feature/a         ●──●─●        ●───●───●
```

**Regla de oro:** nunca se trabaja directamente sobre `main` ni sobre `dev`. Todo cambio nace
en una rama de funcionalidad.

---

## 2. Configuración inicial

Se hace una sola vez, al crear el repositorio.

```bash
# Identidad (si no está configurada globalmente)
git config user.name "Abdiel Avila Neri"
git config user.email "tu-correo@ejemplo.com"

# Crear dev a partir de main y publicarla
git checkout main
git checkout -b dev
git push -u origin dev
```

En GitHub, `Settings → Branches → Add branch protection rule`:

| Opción | Valor |
|---|---|
| Branch name pattern | `main` |
| Require a pull request before merging | Activado |
| Allow specified actors to bypass | Desactivado |

Esa protección es lo que convierte la intención de revisar en un mecanismo real. Sin ella, un
`git push` directo a `main` se lleva por delante el punto 4.4 de la lista de verificación,
porque no quedaría ninguna revisión registrada.

Conviene además dejar `dev` como rama por omisión del repositorio, en
`Settings → General → Default branch`. Así los pull requests apuntan a `dev` sin que tengas
que cambiarlo cada vez, que es el error más frecuente al empezar.

---

## 3. Ciclo de trabajo de una funcionalidad

### 3.1 Crear la rama

```bash
git checkout dev
git pull origin dev
git checkout -b feature/motor-calculo
```

El `pull` antes de ramificar no es opcional: si ramificas sobre una `dev` desactualizada,
después tendrás que resolver conflictos que no existían.

**Nombres de rama:** `feature/` seguido de dos o tres palabras en minúscula separadas por
guiones. Sin acentos ni espacios.

```
feature/motor-calculo
feature/persistencia-auth
feature/adaptador-ia
feature/interfaz
feature/verificacion
feature/despliegue
```

### 3.2 Trabajar y confirmar cambios

```bash
git status                       # qué cambió
git add src/core/calendario.ts   # agrega archivos concretos
git commit -m "feat(core): genera las semanas del horizonte de planificacion"
```

Prefiere `git add <archivo>` sobre `git add .`. Agregar todo de golpe es la forma más común de
subir por accidente un `.env.local` o un archivo temporal.

Para un commit con cuerpo, escribe `git commit` sin `-m` y se abre el editor:

```
feat(core): reparte el presupuesto entre las semanas del horizonte

Implementa RF-07. El reparto cubre cada vencimiento antes de su fecha
limite y aparta el remanente hacia la meta de ahorro. Los importes se
calculan en centavos enteros para evitar error de punto flotante.
```

### 3.3 Publicar la rama

```bash
git push -u origin feature/motor-calculo
```

El `-u` solo se necesita la primera vez. Después basta `git push`.

### 3.4 Mantener la rama al día

Si `dev` avanzó mientras trabajabas:

```bash
git checkout dev
git pull origin dev
git checkout feature/motor-calculo
git merge dev
```

Uso `merge` y no `rebase` de forma deliberada. El rebase produce un historial más limpio, pero
reescribe los commits: cambia sus identificadores y sus fechas. En un proyecto donde el
historial **es evidencia de auditoría** para los puntos 4.3 y 4.7, un historial fiel importa
más que uno bonito.

### 3.5 Abrir el pull request

En GitHub: `Pull requests → New pull request`, con `base: dev` y `compare: feature/...`.

Plantilla de descripción:

```markdown
## Requisitos que implementa
RF-07, RF-08, RF-09

## Cambios
- Genera las semanas del horizonte con dia de inicio configurable
- Deriva los vencimientos de compromisos recurrentes
- Reparte el presupuesto cubriendo cada vencimiento

## Verificacion
- [x] pnpm lint sin errores
- [x] pnpm test: 17 pruebas en verde
- [x] Cobertura del nucleo: 87 %
- [x] Sin importaciones del marco dentro de src/core

## Incidencias que cierra
Closes #3
```

La palabra `Closes #3` cierra automáticamente la incidencia al fusionar, y deja registrada la
relación entre el defecto o requisito y el código que lo resolvió. Eso es evidencia directa de
los puntos 4.6 y 4.7.

### 3.6 Revisar tu propio pull request

Antes de fusionar, abre la pestaña **Files changed** y recorre el diff completo. No es teatro:
leer el código en formato de diferencias, fuera del editor, revela cosas que se escapan
mientras escribes. Busca en concreto:

- Archivos que no debían entrar, sobre todo de entorno o temporales.
- `console.log` olvidados.
- Valores fijos que deberían ser configurables.
- Importaciones prohibidas dentro de `src/core`.

Si encuentras algo, no lo corrijas en silencio: deja un comentario en la línea, corrígelo con
un commit nuevo en la misma rama y responde al comentario. Esa conversación es la evidencia.

### 3.7 Fusionar y limpiar

```bash
# Tras aprobar y fusionar en GitHub con "Squash and merge" o "Create a merge commit"
git checkout dev
git pull origin dev
git branch -d feature/motor-calculo          # borra la rama local
git push origin --delete feature/motor-calculo   # borra la remota
```

**Qué tipo de fusión elegir.** Usa *Create a merge commit* en las funcionalidades grandes,
para conservar los commits individuales que documentan el avance. Usa *Squash and merge* solo
cuando la rama tenga commits de corrección menores que no aportan nada al historial.

---

## 4. Publicar una versión

Al terminar un bloque de fases y tener `dev` estable:

```bash
git checkout dev
git pull origin dev
```

En GitHub, pull request de `dev` hacia `main`, con título `release: v0.1.0 motor de calculo`.
Tras fusionar:

```bash
git checkout main
git pull origin main
git tag -a v0.1.0 -m "Motor de calculo determinista con 17 pruebas unitarias"
git push origin v0.1.0
```

**Versiones planificadas**

| Etiqueta | Momento | Contenido |
|---|---|---|
| `v0.1.0` | Fin de la Fase 1 | Motor de cálculo con sus pruebas |
| `v0.2.0` | Fin de la Fase 2 | Persistencia y autenticación |
| `v0.3.0` | Fin de la Fase 3 | Integración con la inteligencia artificial |
| `v0.9.0` | Fin de la Fase 4 | Aplicación completa, sin verificar |
| `v1.0.0` | Fin de la Fase 6 | Versión liberada y desplegada |

Las etiquetas son lo que satisface el punto 4.8 de la lista de verificación, que exige que las
versiones liberadas sean identificables. Un repositorio sin etiquetas no puede responder a la
pregunta "¿qué código exactamente se entregó?".

---

## 5. Comandos de uso diario

| Necesidad | Comando |
|---|---|
| Ver en qué rama estoy | `git branch` |
| Ver el estado del directorio | `git status` |
| Ver el historial resumido | `git log --oneline --graph --decorate --all` |
| Ver qué cambió en un archivo | `git diff src/core/plan.ts` |
| Cambiar de rama | `git checkout <rama>` |
| Traer cambios del remoto | `git pull origin <rama>` |
| Guardar trabajo sin confirmar | `git stash` |
| Recuperar lo guardado | `git stash pop` |
| Ver las etiquetas | `git tag` |

---

## 6. Errores frecuentes y cómo salir de ellos

### Hice commits en `dev` por error, sin haber creado la rama

```bash
git branch feature/lo-que-sea      # crea la rama con los commits actuales
git reset --hard origin/dev        # devuelve dev al estado del remoto
git checkout feature/lo-que-sea    # continúa el trabajo en la rama correcta
```

Cuidado: `reset --hard` descarta cambios no confirmados. Ejecuta `git status` antes.

### El mensaje del último commit está mal escrito

```bash
git commit --amend -m "feat(core): mensaje corregido"
```

Solo si **no** lo has publicado. Si ya hiciste `push`, déjalo: reescribir historial publicado
causa más problemas de los que resuelve, y en este proyecto el historial es evidencia.

### Subí un archivo que no debía

```bash
git rm --cached .env.local
echo ".env.local" >> .gitignore
git commit -m "chore: excluye el archivo de entorno del control de versiones"
```

**Si el archivo contenía una credencial, esto no basta.** El secreto sigue en el historial y
sigue siendo público. Revoca y regenera la clave de inmediato en el panel del proveedor; es la
contingencia del riesgo RSG-05.

### Un conflicto al fusionar

Git marca las zonas en conflicto dentro del archivo:

```
<<<<<<< HEAD
código de tu rama
=======
código que viene de dev
>>>>>>> dev
```

Edita el archivo dejando la versión correcta, borra las tres líneas marcadoras, y después:

```bash
git add <archivo>
git commit
```

### Quiero deshacer el último commit pero conservar los cambios

```bash
git reset --soft HEAD~1
```

Los archivos vuelven al área de preparación y puedes rehacer el commit con otro mensaje o
partirlo en dos.

---

## 7. Lista de comprobación antes de cada pull request

- [ ] `pnpm lint` sin errores
- [ ] `pnpm test` sin fallos
- [ ] Ningún archivo de entorno ni credencial entre los cambios
- [ ] Los mensajes de commit siguen la convención
- [ ] La rama está actualizada respecto a `dev`
- [ ] La descripción cita los requisitos implementados
