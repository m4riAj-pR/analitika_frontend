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
