

## Plan: PIX Direto ao Selecionar Produto

### Problema atual
Quando o usuario clica em um produto, abre um formulario pedindo dados (email, nome, CPF, telefone) antes de mostrar o QR Code PIX. O usuario quer que ao clicar no produto, o QR Code PIX ja apareca imediatamente. Tambem quer o countdown de 15 segundos (nao 20).

### Mudancas

**1. `src/components/linkinbio/PaymentModal.tsx`**
- Remover o formulario de dados do comprador (CheckoutForm)
- Remover o estado `buyerForm` e a validacao de campos
- Ao abrir o modal, mostrar diretamente a tela PIX (PixPaymentScreen) com o QR Code ja gerado
- Manter os Order Bumps antes da tela PIX para o usuario poder adicionar extras
- Fluxo: produto selecionado → modal abre → mostra produto + order bumps + QR Code PIX tudo na mesma tela (sem etapa intermediaria de formulario)

**2. `src/components/checkout/PixPaymentScreen.tsx`**
- Alterar `WAIT_SECONDS` de 20 para 15 segundos
- Manter todo o resto (QR Code, chave PIX, botao copiar, countdown, botao finalizar)

**3. Estrutura do modal simplificada**
- Barra de urgencia (CountdownTimer) no topo
- Card do produto com nome e preco
- Badge "Pagamento exclusivo via PIX"
- Order Bumps (opcionals)
- QR Code PIX grande centralizado
- Chave PIX + botao copiar
- Resumo do pedido (total dinamico)
- Countdown 15s → botao "Finalizar Pedido"

Nao sera mais necessario importar `CheckoutForm`. Os componentes `OrderBump` e `OrderSummary` permanecem. Tudo fica em uma unica tela scrollavel.

