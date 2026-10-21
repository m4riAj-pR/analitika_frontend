# Documentación del Proyecto Analitika

## Gestión del Token JWT

### Arquitectura de Almacenamiento Seguro (Doble Capa)
Analitika implementa una estrategia de almacenamiento de autenticación de doble capa para garantizar el máximo rendimiento y la máxima seguridad de las credenciales del usuario:

1. **Capa en Memoria RAM (`memoryToken` & `memoryUser`):**
   - Proporciona acceso ultra rápido e instantáneo durante la ejecución de las peticiones HTTP (`request()`) y la validación en tiempo de ejecución (`useAuthGuard`), evitando I/O innecesario.

2. **Capa de Almacenamiento Cifrado en Disco (`expo-secure-store`):**
   - **Móvil (iOS y Android):** El token JWT (`analitika_token`) y los datos sensibles del usuario (`analitika_user`, `current_user`) se almacenan de forma cifrada en hardware seguro (iOS Keychain / Android EncryptedSharedPreferences con Keystore).
   - **Web Fallback (`Platform.OS === 'web'`):** En plataformas Web (donde `expo-secure-store` no está soportado), el sistema realiza un fallback automático e ininterrumpido hacia `AsyncStorage`.

### Proceso de Migración Transparente desde AsyncStorage
Al actualizar la aplicación, la función `migrateFromAsyncStorage()` detecta automáticamente la presencia de un token o datos de usuario previamente almacenados en `AsyncStorage` (texto plano legacy). Si existen:
- Copia de manera segura las credenciales a `SecureStore`.
- Elimina inmediatamente las copias en texto plano residuales de `AsyncStorage`.
- Se ejecuta en el primer acceso (`getToken()` / `getUser()`) de forma idempotente.

### Manejo de Errores y Degradación de Seguridad
Si el hardware del dispositivo o el entorno no soporta la encriptación por hardware (o falla la API nativa de `SecureStore`), el módulo emite una advertencia clara en la consola (`console.warn`) y degrada a almacenamiento de respaldo sin romper el flujo de inicio de sesión ni causar crasheos silenciosos.

### Cierre de Sesión Selectivo (`removeToken`)
Al invocar `removeToken()` (ya sea por acción explícita del usuario en `logout` o por revocación automática tras una respuesta HTTP `401 Unauthorized`):
- Se vacía la memoria RAM (`memoryToken = null`, `memoryUser = null`).
- Se eliminan las entradas `analitika_token`, `analitika_user` y `current_user` de `SecureStore` y `AsyncStorage`.
- **Preservación de Preferencias:** Las configuraciones no sensibles, como la preferencia de tema visual (`analitika_app_theme`), permanecen intactas en `AsyncStorage`.

### Ciclo de Vida de Sesión y Período de Gracia
- **Inicio Automático:** Al iniciar la app, `useAuthGuard` recupera el JWT mediante `getToken()` y valida la sesión contra `/me`.
- **Grace Period (5 minutos):** Mantiene una caché en módulo para evitar revalidaciones excesivas durante la navegación activa dentro de una ventana de 5 minutos (`GRACE_PERIOD_MS`).
- **Revocación por 401:** Si cualquier petición interceptada en `request()` recibe `401 Unauthorized` (exceptuando `/user-company`), el token se purga automáticamente de `SecureStore` y RAM.

---

## Evidencia de Implementación (Tabla 1)

| ID | Funcionalidad | Rol Autorizado | Descripción y Alcance en UI/UX |
| :--- | :--- | :--- | :--- |
| **F01** | Registro de Usuarios | Público | Formulario de registro con validaciones de nombre completo, empresa, email, teléfono y contraseña. |
| **F02** | Inicio de Sesión | Público | Autenticación JWT con persistencia en doble capa (`SecureStore` + RAM). |
| **F03** | Recuperación de Contraseña | Público | Envío de correo de recuperación y solicitud de restablecimiento seguro. |
| **F04** | Dashboard de Campañas y KPIs | Todos (RBAC visual) | Clics, conversiones y tasa de conversión, gráfico de clics por día (últimos 7 días con actividad) y tabla de clics recientes. Manager no ve KPIs financieros (el backend no los envía). |
| **F05** | Listado de Campañas | Todos | Listado con tarjetas interactivas, estados de campaña y buscador en tiempo real. |
| **F06** | Creación y Edición de Campañas | Owner, Manager | Nombre, descripción, estado, fechas validadas, presupuesto, inversión ejecutada, canal y URL de destino obligatoria para el enlace de seguimiento. |
| **F07** | Generación de Tracking Links | Owner, Manager | Enlaces de seguimiento generados automáticamente con opción de copiado al portapapeles. |
| **F08** | Ranking de Campañas | Todos (RBAC visual) | Top 10 por clics registrados (`/analitika/campaigns/top`). Owner ve ingresos y ROI calculado (beneficio ÷ inversión). |
| **F09** | Gestión de Notificaciones | Todos | Bandeja de notificaciones del backend con conteo de no leídas y marcado como leída. |
| **F10** | Perfil de Usuario | Todos | Datos personales y empresa(s) del usuario. Owner y Super Admin pueden editar perfil y contraseña (la API lo restringe a esos roles). |
| **F11** | Modo Oscuro / Claro | Todos | Switch de configuración con sincronización reactiva en todo el árbol de componentes mediante `ThemeContext`. |
| **F12** | Gestión de Empleados (Managers) | Owner | Sección exclusiva para Owner que permite dar de alta y revocar acceso a Managers de la empresa. |
| **F13** | Registro y Redirección de Clics | Tracking Público | Captura de metadata de navegación (dispositivo, país, referrer, UTMs) y redirección final. |
| **F14** | Registro de Conversiones | Webhooks / API | Registro de ingresos y eventos de conversión vinculados a enlaces de tracking. |
| **F15** | Control de Acceso RBAC | Super Admin, Owner, Manager | Restricción jerárquica tanto a nivel de API como en renderizado condicional de componentes. |
| **F16** | Almacenamiento Seguro (Doble Capa) | Sistema | Cifrado nativo en disco mediante Keychain / Keystore con fallback a AsyncStorage en Web. |

---

## RBAC en la Capa de Presentación

| Componente / Pantalla | Super Admin (Rol 1) | Owner (Rol 2) | Manager (Rol 3) | Justificación y Comportamiento UI |
| :--- | :---: | :---: | :---: | :--- |
| **KPIs Financieros (Ingresos, ROI, ROAS, CPC, CPA, Gasto)** | Visible | Visible | **Oculto** | Se filtran en el backend y se ocultan condicionalmente en `kpiGrid` (`!isManager`). |
| **Gestión de Empleados (F12)** | Visible | Visible | **Oculto** | Switch y lista de managers restringida al Owner de la empresa. |

---

## Principios de Diseño y Retroalimentación Visual (Tabla 4)

1. **Estados Cromáticos Coherentes:**
   - **Activa:** Insignia verde (`#10B981` / fondo menta suave).
   - **Pausada / Borrador / Finalizada:** Insignia gris neutro (`#64748B` / fondo pizarra).
   - **Error al cargar métricas:** Banner amarillo suave (`themeColors.warning`) con icono `warning-outline`.
2. **Empty States Respetuosos:** Contenedor centralizado con icono de contorno (`megaphone-outline`), título descriptivo, párrafo explicativo sin jerga técnica y botón de acción primario.
3. **Modales Nativos Consistentes:** El modal de explicación de la tasa de conversión reutiliza el diseño con overlay oscuro translúcido (`rgba(0,0,0,0.45)`), tarjeta con bordes redondeados (`radii.xl`), icono temático y botón primario de cierre.
4. **Formato Temporal Humano:** Fechas presentadas en formato relativo comprensible (*"Hace un momento"*, *"Hace 15 min"*, *"Hace 3 h"*), facilitando la lectura sin exigir cálculos mentales al usuario.

---

## Integraciones externas

La integración con Meta Marketing API (OAuth, sincronización de gasto e impresiones, vinculación de campañas externas) fue retirada de la aplicación móvil. Las métricas provienen exclusivamente de los enlaces de seguimiento de Analitika (`/c/{id_link}`), por lo que el CTR basado en impresiones dejó de mostrarse y se reemplazó por la **tasa de conversión** (conversiones ÷ clics).
