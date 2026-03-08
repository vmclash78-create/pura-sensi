

## Plano de Implementação - Pura Sensi

### O que será feito

1. **Trocar branding**: Copiar as duas imagens enviadas para `src/assets/` (logo PNG transparente como logo principal, JPEG circular como avatar). Atualizar `PROFILE` com nome "Pura Sensi", Instagram `https://www.instagram.com/purasensi.xit`.

2. **Mudar esquema de cores para azul**: Atualizar `src/index.css` - todas as variáveis `--primary`, `--accent`, `--ring` etc. de vermelho (`0 75% 50%`) para azul (ex: `220 80% 50%`). O Android icon fill também muda para azul.

3. **Tela de pagamento (modal)**: Ao clicar em qualquer link, em vez de abrir URL externa, abre um Dialog/modal com:
   - Nome do produto e preço
   - Formulário: Nome, Email, CPF
   - Botão "Pagar" (preparado para integração futura com Mercado Pago)
   - Visual dark/azul consistente com o tema
   - Por enquanto sem integração real, apenas visual funcional

4. **Mais produtos abaixo dos links**: Adicionar uma seção extra abaixo dos links principais com cards de produtos adicionais (dados de exemplo), cada um também abrindo o modal de pagamento ao clicar.

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/assets/avatar.jpeg` | Nova imagem (circular ninja) |
| `src/assets/logo.png` | Substituída pela logo Pura Sensi |
| `src/index.css` | Cores de vermelho para azul |
| `src/pages/LinkInBio.tsx` | Profile data, modal de pagamento, seção de produtos extras |

### Detalhes técnicos

- O modal usa o componente `Dialog` existente do projeto (Radix UI)
- Os links passam de `<a href>` para `<button onClick>` que abre o modal com dados do produto
- Estrutura preparada para futura integração com API do Mercado Pago via edge function
- Produtos de exemplo com preços fictícios em BRL

