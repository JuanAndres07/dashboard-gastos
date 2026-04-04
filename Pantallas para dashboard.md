# Pantallas para dashboard:





\- Pantalla Principal (Dashboard)

\- Pantalla de Transacciones (Historial)

\- ~~Gestión de Categorías~~

\- Pagos Habituales (Suscripciones)

\- Gráficos Detallados

\- Configuración de Perfil (User Settings)

\- Presupuestos Mensuales (Budgets)







## Módulos:





**1. Módulo de Acceso (Auth):**

Estas son las puertas de entrada. Su función es gestionar la sesión de Supabase.

* Pantalla de Login: Acceso para usuarios existentes.
* Pantalla de Registro: Creación de nuevas cuentas.
* Recuperación de Contraseña: Formulario para enviar el correo de restablecimiento (Supabase tiene una función específica para esto).





**2. Módulo Principal (Core)**

El corazón del día a día del usuario.

* Dashboard (Inicio): Tarjetas de resumen (Saldo actual, total de ingresos/gastos del mes).

&#x09;Acceso rápido a "Nuevo Gasto".

&#x09;Mini-gráfico de barras o dona con el gasto por categoría.

* Historial de Transacciones: Tabla con filtros (por fecha, por tipo o por categoría).

&#x09;Acciones de Editar y Eliminar cada registro.

* Formulario de Movimientos: Ventana (o modal) para insertar Ingresos o Gastos vinculados a una categoría.





**3. Módulo de Gestión y Personalización**

* Gestión de Categorías: Lista de categorías globales (lectura).

&#x09;Crear/Editar/Eliminar categorías propias.

* Pagos Habituales (Suscripciones): Configurar gastos que se repiten.





**4. Módulo de Análisis y Reportes**

Para usuarios que quieren ver el "Big Picture".

* Estadísticas Detalladas: Gráficos comparativos mes a mes.

&#x09;Análisis de ahorro.

* Exportación: Botón para generar reportes en PDF o CSV.





**5. Módulo de Usuario y Seguridad (Settings)**

Donde el usuario controla su cuenta.

* Perfil de Usuario:

&#x09;Cambiar nombre de usuario y foto de perfil (usando Supabase Storage).

&#x09;Cambio de correo electrónico.

* Seguridad:

&#x09;Cambio de contraseña.

&#x09;Configuración de Autenticación en dos pasos (2FA).

