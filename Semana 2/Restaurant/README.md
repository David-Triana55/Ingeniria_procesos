# Sistema de Gestión de Pedidos en Tiempo Real para Restaurantes

## Descripción del Proyecto

Este proyecto consiste en el desarrollo de una plataforma SaaS para la gestión de pedidos en tiempo real en restaurantes. El sistema permitirá administrar pedidos, productos, inventario y estadísticas, facilitando la comunicación entre clientes, cocina y administradores mediante actualizaciones en tiempo real.

La plataforma busca optimizar los procesos internos de restaurantes pequeños y medianos, reduciendo errores manuales, mejorando los tiempos de atención y permitiendo un mejor control operativo.

---

# Objetivo General

Desarrollar una plataforma web para la gestión de pedidos en tiempo real en restaurantes, permitiendo mejorar la administración de órdenes, productos e inventario mediante herramientas tecnológicas modernas.

---

# Alcance del Proyecto

El sistema permitirá:

* Gestión de usuarios y roles.
* Gestión de productos del menú.
* Creación y seguimiento de pedidos.
* Actualización de estados en tiempo real.
* Gestión de cocina.
* Estadísticas administrativas.
* Gestión básica de inventario.
* Notificaciones en tiempo real.

---

# Requerimientos Funcionales

## Gestión de usuarios

1. El sistema debe permitir el registro de usuarios.
2. El sistema debe permitir el inicio y cierre de sesión.
3. El sistema debe permitir la recuperación de contraseña.
4. El sistema debe manejar roles de usuario:

   * Administrador
   * Mesero
   * Cocina
   * Cliente

---

## Gestión de productos

5. El administrador debe poder crear productos del menú.
6. El administrador debe poder editar productos.
7. El administrador debe poder eliminar productos.
8. El sistema debe permitir visualizar productos disponibles.
9. El sistema debe permitir clasificar productos por categorías.

---

## Gestión de pedidos

10. El cliente debe poder realizar pedidos desde la plataforma.
11. El sistema debe calcular automáticamente el valor total del pedido.
12. El cliente debe poder agregar observaciones al pedido.
13. El sistema debe generar un identificador único para cada pedido.
14. El sistema debe evitar la duplicación de pedidos.
15. El sistema debe permitir cancelar pedidos antes de ser preparados.

---

## Gestión de cocina

16. El personal de cocina debe visualizar los pedidos pendientes.
17. El personal de cocina debe actualizar el estado del pedido:

* Pendiente
* En preparación
* Listo
* Entregado

18. El sistema debe notificar en tiempo real los cambios de estado del pedido.

---

## Gestión administrativa

19. El administrador debe visualizar estadísticas de ventas.
20. El administrador debe visualizar el historial de pedidos.
21. El administrador debe gestionar empleados del restaurante.
22. El administrador debe visualizar métricas en tiempo real.

---

## Gestión de inventario

23. El sistema debe descontar automáticamente ingredientes del inventario.
24. El sistema debe generar alertas cuando existan productos con bajo stock.

---

## Notificaciones

25. El sistema debe enviar notificaciones sobre cambios de estado del pedido.
26. El sistema debe mostrar actualizaciones en tiempo real a los usuarios conectados.

---

# Requerimientos No Funcionales

## Rendimiento

1. El sistema debe responder a las solicitudes en un tiempo menor a 2 segundos.
2. Las actualizaciones en tiempo real deben reflejarse en menos de 1 segundo.

---

## Seguridad

3. Las contraseñas deben almacenarse de forma cifrada.
4. El sistema debe implementar autenticación mediante JWT.
5. El sistema debe restringir el acceso según roles de usuario.
6. El sistema debe proteger la información sensible de los usuarios.

---

## Escalabilidad

7. El sistema debe soportar múltiples restaurantes simultáneamente.
8. El sistema debe permitir escalabilidad horizontal.

---

## Disponibilidad

9. El sistema debe garantizar una disponibilidad mínima del 99%.

---

## Compatibilidad

10. El sistema debe ser compatible con dispositivos móviles, tablets y computadores.
11. El sistema debe funcionar en los navegadores modernos.

---

## Usabilidad

12. La interfaz debe ser intuitiva y fácil de utilizar.
13. El diseño debe ser responsive.

---

## Mantenibilidad

14. El sistema debe implementar una arquitectura modular.
15. El código debe permitir futuras modificaciones sin afectar otros módulos.

---

## Confiabilidad

16. El sistema debe garantizar la integridad de los datos.
17. El sistema debe evitar inconsistencias en los pedidos en tiempo real.

---

## Mockup
### Mockup Figma

https://www.figma.com/make/O3vY4Wx5QpEG1cvO2Uo1al/Restaurant?t=JHJVdaDoyTzcswhl-1&preview-route=%2Fdashboard

### Site
https://snake-volt-24649630.figma.site/dashboard

### Interfaces del Sistema

## Login
![alt text](image-3.png)

## Dashboard
![alt text](image.png)

## Gestión de pedidos
![alt text](image-2.png)

## Modulo de cocina
![alt text](image-4.png)

## Gestión de inventario
![alt text](image-5.png)

## Reportes
![alt text](image-1.png)

## Perfil de usuario
![alt text](image-6.png)