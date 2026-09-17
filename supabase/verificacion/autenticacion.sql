-- ============================================================================
-- Verificación del almacenamiento de contraseñas (RNF-05, control AM-02)
-- ----------------------------------------------------------------------------
-- Consultas de solo lectura sobre auth.users. Se ejecutan en el editor SQL de
-- Supabase después de registrar al menos un usuario. No muestran ninguna
-- derivación completa: solo su prefijo, que identifica el algoritmo.
-- ============================================================================

-- 1. Algoritmo con el que están derivadas las contraseñas.
--    Esperado: una sola fila con prefijo "$2a$10$" (bcrypt, factor de costo 10).
select
  left(encrypted_password, 7) as prefijo,
  count(*) as usuarios
from auth.users
where coalesce(encrypted_password, '') <> ''
group by left(encrypted_password, 7);

-- 2. Contraseñas almacenadas en un formato distinto de bcrypt.
--    Una derivación bcrypt mide 60 caracteres: prefijo de 7 más 53 de sal y resultado.
--    Esperado: 0.
select count(*) as contrasenas_sin_bcrypt
from auth.users
where coalesce(encrypted_password, '') <> ''
  and encrypted_password !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$';

-- 3. Usuarios sin perfil. Comprueba el disparador de la migración del esquema.
--    Esperado: 0.
select count(*) as usuarios_sin_perfil
from auth.users u
left join public.perfiles p on p.id = u.id
where p.id is null;
