-- Aplicar antes de desplegar el backend que verifica revocaciones.
CREATE TABLE IF NOT EXISTS "TOKEN_REVOCADO" (
  "tok_huella" char(64) PRIMARY KEY,
  "tok_expira" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_token_revocado_expira"
  ON "TOKEN_REVOCADO" ("tok_expira");

-- Conservar acceso para los roles que ya administran datos en USUARIO.
DO $$
DECLARE rol record;
BEGIN
  FOR rol IN
    SELECT grantee FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND table_name = 'USUARIO'
      AND privilege_type IN ('SELECT', 'INSERT', 'DELETE') AND grantee <> 'PUBLIC'
    GROUP BY grantee HAVING COUNT(DISTINCT privilege_type) = 3
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, DELETE ON "TOKEN_REVOCADO" TO %I', rol.grantee);
  END LOOP;
END $$;
