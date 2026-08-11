# Refactor sem mudança de UI

Auditoria feita. O código já está razoavelmente bem organizado (hooks por feature, `lib/` com utils, shadcn intocado). Vou focar apenas nos pontos que trazem valor real — sem "refactor por refactor". Componentes `ui/*` do shadcn não serão tocados (padrão da lib).

## Achados relevantes

- **`PaymentModal.tsx` (289 linhas)** — mistura validação de CPF/CNPJ, `CountdownTimer` interno, chamada da edge function e estado. Deve virar orquestrador puro.
- **Validação de CPF/CNPJ duplicada** — mesma lógica em `PaymentModal.tsx` e `supabase/functions/sigilopay-create-pix/index.ts`. No frontend pode virar util compartilhada (edge function fica com sua cópia — runtime Deno separado).
- **`formatBRL` duplicado** em 3 arquivos (`LinkInBio`, `PaymentModal`, `SigiloPayCharge`). Já existe `src/lib/constants.ts` — bom lugar para um `lib/format.ts`.
- **`onlyDigits` / `isSameDigitSequence`** — utilitários locais que merecem ficar em `lib/document.ts`.
- **Constantes soltas**: `SIGILO_BASE`, tempo do countdown (300s), intervalo de polling (5s), delay do "copiado" (2500ms) — extrair para `lib/constants.ts`.
- **`CountdownTimer`** dentro de `PaymentModal` — subcomponente que só usa props, extrair.
- **Chamada da edge function** dentro do handler — extrair para `hooks/useSigiloPayCharge.ts` (create + estado de charge/loading).

## Plano de execução

### 1. Novos utilitários (`src/lib/`)
- `src/lib/format.ts` → `formatBRL(value)`.
- `src/lib/document.ts` → `onlyDigits`, `isValidCpf`, `isValidCnpj`, `isValidDocument`.
- Adicionar em `src/lib/constants.ts`:
  ```ts
  export const CHECKOUT_TIMER_SECONDS = 300;
  export const PIX_POLLING_INTERVAL_MS = 5000;
  export const PIX_ONPAID_REDIRECT_MS = 1500;
  export const COPY_FEEDBACK_MS = 2500;
  ```

### 2. Novos componentes
- `src/components/checkout/CountdownTimer.tsx` — extrair de `PaymentModal`. Props: `seconds?: number`.

### 3. Novo hook
- `src/hooks/useSigiloPayCharge.ts` — encapsula `supabase.functions.invoke("sigilopay-create-pix")`, retorna `{ charge, isLoading, createCharge(payload), reset() }`.

### 4. Ajustes nos consumidores (comportamento idêntico)
- `PaymentModal.tsx`: importa helpers novos, remove código extraído. Renomeia locais:
  - `buyerForm` → mantém (já claro), mas expõe `hasFormErrors` derivada.
  - `charge` handler → usa `createCharge` do hook.
- `SigiloPayCharge.tsx`: usa `formatBRL`, `PIX_POLLING_INTERVAL_MS`, `PIX_ONPAID_REDIRECT_MS`, `COPY_FEEDBACK_MS`.
- `LinkInBio.tsx`: usa `formatBRL` do lib. Extrai `PROFILE` para `src/lib/constants.ts` (`PURA_SENSI_PROFILE`) — a config estava no meio do componente.

### 5. Edge function
- **Não tocar** duplicação de CPF/CNPJ na edge function (runtime Deno, sem imports do bundle do Vite). Fica documentado com comentário.

## Fora de escopo (justificado)
- `src/components/ui/*` (shadcn) — padrão da lib, não mexer.
- `src/integrations/supabase/types.ts` — gerado automaticamente.
- Reestruturação por feature-folders — o projeto ainda é pequeno; agrupar por tipo (`hooks/`, `components/checkout/`, `components/linkinbio/`) segue funcionando e mudar tudo agora só cria churn de imports sem ganho.
- Barrel `index.ts` — projeto pequeno; barris adicionam overhead ao Vite/tree-shaking sem benefício claro aqui.
- Renomear props / signatures públicas dos hooks (`useLinkProducts`, `useOrderBumps` etc.) — a constraint pede para preservar interfaces exportadas.

## Saída esperada

```
[ EXTRACTED ] formatBRL (3 lugares) → src/lib/format.ts
[ EXTRACTED ] onlyDigits + isValidCpf/Cnpj/Document → src/lib/document.ts
[ EXTRACTED ] CountdownTimer (dentro de PaymentModal) → src/components/checkout/CountdownTimer.tsx
[ EXTRACTED ] lógica de invoke create-pix → src/hooks/useSigiloPayCharge.ts
[ MOVED ]     PROFILE (LinkInBio) + constantes de tempo → src/lib/constants.ts
[ SPLIT ]     PaymentModal.tsx (289L) → PaymentModal (orquestrador) + CountdownTimer + useSigiloPayCharge
```

Confirma que posso aplicar? Nenhuma mudança de UI, rota ou comportamento — só reorganização.
