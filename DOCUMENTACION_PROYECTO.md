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
| **F04** | Dashboard de Campañas y KPIs | Todos (RBAC visual) | Visualización de métricas de campaña, gráfico de barras por día y tabla de clics. Manager tiene vista restringida a KPIs no financieros. Indicador de origen del dato (Sincronizado vs Manual) y métrica de CTR con modal explicativo. |
| **F05** | Listado de Campañas | Todos | Listado con tarjetas interactivas, estados de campaña y buscador en tiempo real. |
| **F06** | Creación y Edición de Campañas | Owner, Manager | Formulario con plantillas rápidas, selector de canal, fechas y gasto manual. Para Owner con canal Meta y conexión activa, expone selector de vinculación con campañas de Meta Ads y toggle de sincronización automática. |
| **F07** | Generación de Tracking Links | Owner, Manager | Enlaces de seguimiento generados automáticamente con opción de copiado al portapapeles. |
| **F08** | Ranking de Campañas | Todos (RBAC visual) | Tarjetas ordenadas por rendimiento con insignia de podio, clics, ROI (oculto a Manager) e indicador de origen Meta Ads. |
| **F09** | Gestión de Notificaciones | Todos | Bandeja de notificaciones con conteo de no leídas, marcado como leída y eliminación. |
| **F10** | Perfil de Usuario | Todos | Edición de datos personales, visualización de empresa y cambio de contraseña. |
| **F11** | Modo Oscuro / Claro | Todos | Switch de configuración con sincronización reactiva en todo el árbol de componentes mediante `ThemeContext`. |
| **F12** | Gestión de Empleados (Managers) | Owner | Sección exclusiva para Owner que permite dar de alta y revocar acceso a Managers de la empresa. |
| **F13** | Registro y Redirección de Clics | Tracking Público | Captura de metadata de navegación (dispositivo, país, referrer, UTMs) y redirección final. |
| **F14** | Registro de Conversiones | Webhooks / API | Registro de ingresos y eventos de conversión vinculados a enlaces de tracking. |
| **F15** | Control de Acceso RBAC | Super Admin, Owner, Manager | Restricción jerárquica tanto a nivel de API como en renderizado condicional de componentes. |
| **F16** | Almacenamiento Seguro (Doble Capa) | Sistema | Cifrado nativo en disco mediante Keychain / Keystore con fallback a AsyncStorage en Web. |
| **F17** | Cuentas Publicitarias y Meta Ads | Owner (Super Admin) | Sección en Perfil para conectar cuentas de Meta Marketing API vía OAuth 2.0 (`expo-web-browser`), listar conexiones activas con formato de tiempo relativo, sincronización bajo demanda y desconexión segura. Vinculación opcional en creación de campaña (F06). |

---

## RBAC en la Capa de Presentación

| Componente / Pantalla | Super Admin (Rol 1) | Owner (Rol 2) | Manager (Rol 3) | Justificación y Comportamiento UI |
| :--- | :---: | :---: | :---: | :--- |
| **Sección "Cuentas publicitarias" (F10 - Perfil)** | Visible / Activo | Visible / Activo | **Oculto** | La gestión contractual y de accesos a cuentas publicitarias de la empresa es responsabilidad exclusiva del Owner. |
| **Botón "Conectar cuenta de Meta Ads"** | Visible / Activo | Visible / Activo | **Oculto** | No se renderiza para Manager en ningún flujo. |
| **Acción "Desconectar" cuenta publicitaria** | Visible / Activo | Visible / Activo | **Oculto** | Acción destructiva con diálogo de confirmación `Alert.alert`, reservada a Owner. |
| **Campo "Vincular con campaña de Meta Ads" (F06)** | Visible / Activo | Visible / Activo | **Oculto** | Aunque el Manager puede crear campañas, la asignación a cuentas publicitarias conectadas a nivel de empresa está reservada al Owner. |
| **Toggle "Sincronización automática" (F06)** | Visible / Activo | Visible / Activo | **Oculto** | Exclusivo de Owner cuando se selecciona una campaña externa. |
| **Indicador "Sincronizado con Meta Ads" (F04 - Dashboard)** | Visible | Visible | Visible | Es puramente informativo sobre la fuente del dato mostrado, no otorga privilegios de modificación. |
| **Banner de advertencia por error de sincronización (F04)** | Visible | Visible | Visible | Mantiene la transparencia operativa sin alarmar al usuario ni romper el layout. |
| **Métrica de CTR y Modal Explicativo (F04)** | Visible | Visible | Visible | Métrica de rendimiento de anuncios accesible para cualquier usuario que analice la campaña. |
| **KPIs Financieros (Ingresos, ROI, ROAS, CPC, CPA, Gasto)** | Visible | Visible | **Oculto** | Se filtran en el backend y se ocultan condicionalmente en `kpiGrid` (`!isManager`). |
| **Gestión de Empleados (F12)** | Visible | Visible | **Oculto** | Switch y lista de managers restringida al Owner de la empresa. |

---

## Principios de Diseño y Retroalimentación Visual (Tabla 4)

1. **Insignias Neutrales para Proveedores:** Se utiliza un badge de texto estilizado (`"META ADS"` / `"Meta"`) con colores institucionales violetas de la aplicación (`themeColors.primary` / `palette.purple4`), evitando marcas registradas oficiales de terceros sin autorización comercial.
2. **Estados Cromáticos Coherentes:**
   - **Activa:** Insignia verde (`#10B981` / fondo menta suave).
   - **Expirada / Revocada:** Insignia gris neutro (`#64748B` / fondo pizarra).
   - **Error de sincronización:** Insignia roja (`#EF4444` / fondo rojizo claro).
   - **Advertencia en Dashboard:** Banner amarillo suave (`themeColors.warning`) con icono `warning-outline`.
3. **Empty States Respetuosos:** Contenedor centralizado con icono de contorno (`megaphone-outline`), título descriptivo, párrafo explicativo sin jerga técnica y botón de acción primario.
4. **Modales Nativos Consistentes:** El modal de explicación del CTR reutiliza el diseño con overlay oscuro translúcido (`rgba(0,0,0,0.45)`), tarjeta con bordes redondeados (`radii.xl`), icono temático y botón primario de cierre.
5. **Formato Temporal Humano:** Fechas de sincronización presentadas en formato relativo comprensible (*"Hace un momento"*, *"Hace 15 min"*, *"Hace 3 h"*), facilitando la lectura sin exigir cálculos mentales al usuario.

---

## Decisiones de Diseño UI/UX (Meta Marketing API)

- **Nombre amigable para CTR:** Se emplea la etiqueta visible `"CTR"` en lugar del término técnico de backend `"CTR_real"`.
- **Texto del Modal Explicativo de CTR:**
  > *"Este porcentaje compara cuántas veces se mostró tu anuncio con cuántas personas llegaron realmente a tu página. Puede haber una pequeña diferencia porque algunas personas cierran la app antes de cargar la página."*
  Se evitó intencionalmente el uso de conceptos técnicos abstractos como *"impresiones API"* o *"tracking propio"* para garantizar la comprensión por parte de cualquier usuario.
- **Tratamiento de campañas sin datos de impresiones:** En campañas sin conexión API o sin impresiones registradas, el CTR se muestra explícitamente como `"No disponible"` en lugar de `0.0%`, evitando conclusiones erróneas de desempeño publicitario.
- **Flujo OAuth seguro con Cancelación Silenciosa:** Si el usuario cancela o cierra la ventana de autorización de Meta, la aplicación retorna al estado previo de manera inmediata y limpia, sin desplegar alertas de error falsas.
- **Deep Linking con Scheme del Proyecto:** Se utiliza el scheme oficial `analitikaapp://ad-connections/callback` garantizando el retorno ininterrumpido a la aplicación móvil.

