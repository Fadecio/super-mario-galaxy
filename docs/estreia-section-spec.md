# Spec — Seção Estréia / Contador

> Documento de especificação descritiva. Não contém código de implementação.
> Tokens (cores, tipografia, espaçamentos, raios, sombras) são definidos no `DESIGN.md`. Este spec referencia tokens por nome; não duplica valores.

---

## 1. Objetivo

Apresentar a contagem regressiva até a estreia do filme conceitual *Super Mario Galaxy: O Filme*, ancorada por um headline emocional e uma data de estreia explícita. A seção comunica:

- Quanto tempo falta até a estreia (contador dinâmico).
- A data exata da estreia (texto fixo).
- Identidade temática espacial (background com nebulosas, estrelas e galáxia).
- Crédito conceitual e disclaimer de marcas registradas (rodapé).

A seção é estática em conteúdo textual e dinâmica apenas no contador (atualização por JS).

---

## 2. Inventário de elementos

Lista derivada estritamente do mapeamento prévio. Nenhum elemento adicionado.

| # | Elemento | Tipo | Conteúdo |
|---|----------|------|----------|
| 1 | Headline | texto, 2 linhas | "Cada estrela guarda uma historia. A sua começa agora." |
| 2 | Sublinha | texto, caixa alta, espaçado | "SUPER MARIO GALAXY: O FILME" |
| 3 | Divisor horizontal curto | elemento gráfico | — |
| 4 | Label do contador | texto, caixa alta, espaçado | "ESTREIA NOS CINEMAS EM" |
| 5 | Card do contador | container | 4 unidades + 3 separadores verticais |
| 5a | Unidade DIAS | número + label | inicial "00" / "DIAS" |
| 5b | Unidade HORAS | número + label | inicial "00" / "HORAS" |
| 5c | Unidade MIN | número + label | inicial "00" / "MIN" |
| 5d | Unidade SEG | número + label | inicial "00" / "SEG" |
| 6 | Texto da data | texto pequeno, centralizado | "Dia 25 de Dezembro, 2026" |
| 7 | Rodapé — nome do projeto | texto | "Super Mario Galaxy: O Filme" |
| 8 | Rodapé — disclaimer | texto pequeno, 1 linha | "Projeto conceitual para fins educacionais. Nintendo, Mario e personagens relacionados são marcas registradas da Nintendo Co., Ltd." |
| 9 | Background — cena espacial | imagem decorativa | nebulosas (roxa/rosa) + estrelas brancas + galáxia espiral |
| 10 | Estrelas amarelas decorativas | elementos gráficos (estilo Mario Galaxy, com olhos) | distribuídas nos cantos/margens |

**Não incluído (ausente do print):** botão CTA, formulário, links de navegação interna à seção, ícones sociais.

**Pertence ao carrossel da página, não à seção:** indicadores de paginação e setas no topo do print. Estão fora do escopo deste spec.

---

## 3. Estrutura HTML (descritiva)

Hierarquia semântica recomendada. Atributos `data-*` são contrato JS (ver §8).

```
<section> [seção estréia]
├── <div> [container/wrapper centralizado]
│   ├── <div> [bloco textual superior]
│   │   ├── <h1> ou <h2>  → Headline (com <span> nas palavras destacadas)
│   │   ├── <p>           → Sublinha "SUPER MARIO GALAXY: O FILME"
│   │   └── <hr> ou <div> → Divisor curto
│   │
│   ├── <div> [bloco contador]
│   │   ├── <p>                                    → Label "ESTREIA NOS CINEMAS EM"
│   │   ├── <div data-target-date="[DATA_DA_ESTREIA]"> [card contador]
│   │   │   ├── <div> [unidade dias]
│   │   │   │   ├── <span data-countdown="days">00</span>
│   │   │   │   └── <span> [label "DIAS"]
│   │   │   ├── <div> [unidade horas]
│   │   │   │   ├── <span data-countdown="hours">00</span>
│   │   │   │   └── <span> [label "HORAS"]
│   │   │   ├── <div> [unidade minutos]
│   │   │   │   ├── <span data-countdown="minutes">00</span>
│   │   │   │   └── <span> [label "MIN"]
│   │   │   └── <div> [unidade segundos]
│   │   │       ├── <span data-countdown="seconds">00</span>
│   │   │       └── <span> [label "SEG"]
│   │   └── <p>                                    → "Dia 25 de Dezembro, 2026"
│   │
│   └── <footer> [rodapé da seção]
│       ├── <p> → "Super Mario Galaxy: O Filme"
│       └── <p> → disclaimer
│
└── [elementos decorativos absolutos: estrelas amarelas, background space]
```

**Notas estruturais:**
- O `data-target-date` fica no container do card; os 4 spans com `data-countdown` ficam dentro dele.
- Separadores verticais entre unidades podem ser pseudo-elementos CSS ou `<div>` decorativos (`aria-hidden`).
- Estrelas amarelas decorativas e background são posicionados absolutamente em relação à `<section>`, não interferem no fluxo do conteúdo.

---

## 4. Camadas (z-index / stacking)

Da camada mais ao fundo para a mais à frente:

1. **Background da seção** — gradiente/imagem espacial base.
2. **Nebulosas e galáxia** — imagens decorativas posicionadas nos cantos.
3. **Estrelas brancas pequenas** — pontos/sprites espalhados.
4. **Estrelas amarelas decorativas** — elementos posicionados absolutamente próximos às margens.
5. **Conteúdo textual e card do contador** — camada principal, centralizada.
6. **Card do contador** — recebe leve elevação visual (fundo escuro semi-transparente sobre o background).

Estrelas amarelas e nebulosas ficam **abaixo** do card do contador para não competir com a leitura dos números.

---

## 5. Tokens utilizados (referência ao DESIGN.md)

Esta seção lista *categorias* de tokens consumidas. Os valores concretos vivem no `DESIGN.md`.

### Cores
- Fundo da seção: token de background escuro/espacial.
- Texto headline (padrão): token de texto primário claro.
- Texto headline (destaque "estrela", "agora"): token de cor de acento (amarelo/dourado).
- Sublinha e labels caixa alta: token de texto secundário/atenuado.
- Fundo do card do contador: token de superfície elevada com transparência.
- Borda do card (se aplicável): token de borda sutil.
- Números do contador: token de texto primário claro (peso bold).
- Labels do contador: token de texto terciário/atenuado.
- Divisores verticais do contador: token de divisor sutil.

### Tipografia
- Headline: token de título display.
- Sublinha e labels caixa alta: token de eyebrow/caps com letter-spacing amplo.
- Números do contador: token de display numérico (peso bold).
- Labels das unidades: token de caption caixa alta.
- Texto da data: token de body pequeno.
- Rodapé (nome projeto): token de body médio.
- Rodapé (disclaimer): token de caption.

### Espaçamento
- Padding interno da seção (vertical e horizontal): tokens de spacing da seção.
- Gap entre headline → sublinha → divisor → label → card → data: tokens de spacing entre blocos.
- Gap entre unidades dentro do card: token de spacing horizontal médio.
- Padding interno do card: tokens de spacing do card.

### Raios e sombras
- Raio do card do contador: token de border-radius médio.
- Sombra do card (se aplicável): token de elevação sutil.

> **Regra:** nenhum valor numérico (cor, px, rem) é definido neste spec. Tudo via token nomeado do DESIGN.md.

---

## 6. Suposições e ambiguidades resolvidas

Decisões tomadas para destravar a implementação. Marcadas como **[SUPOSIÇÃO]** quando não confirmadas pelo print.

1. **Acentuação do headline** — o print mostra "historia" e "comeca" sem acentos. **[SUPOSIÇÃO]**: tratar como erro do mockup; usar grafia correta em português: "história" e "começa". Confirmar com design antes de publicar.
2. **Palavras destacadas em amarelo** — confirmadas: "estrela" e "agora.". O ponto final acompanha "agora" no destaque (visualmente integrado).
3. **Quebra de linha do headline** — após "uma" no desktop. Em telas menores pode rebrar livremente (ver §7).
4. **Divisor horizontal** — **[SUPOSIÇÃO]**: elemento gráfico independente (linha curta), não parte de tipografia.
5. **Quantidade de estrelas amarelas** — **[SUPOSIÇÃO]**: 5 estrelas decorativas distribuídas nos cantos/margens. Posições aproximadas: superior-esquerda, superior-direita, meio-direita, inferior-esquerda, inferior-direita (próxima à galáxia).
6. **Borda do card** — **[SUPOSIÇÃO]**: borda sutil presente, valor exato definido no DESIGN.md.
7. **Hora capturada no contador (244d 10h 09m 09s)** — apenas estado de mockup; valores iniciais devem ser "00" conforme contrato.
8. **Rodapé** — **[SUPOSIÇÃO]**: rodapé pertence à seção (não é rodapé global). Caso seja global, mover para componente próprio fora desta seção.
9. **Ausência de CTA** — confirmada pelo print; a seção não possui botão de ação.
10. **Data alvo `[DATA_DA_ESTREIA]`** — placeholder. Valor real a ser preenchido pela implementação no atributo `data-target-date`. Formato esperado: ISO 8601 (`AAAA-MM-DDTHH:MM:SS`), correspondendo a "25 de Dezembro de 2026".

---

## 7. Responsividade

Comportamento por breakpoint. Breakpoints concretos vivem no DESIGN.md.

### Desktop (≥ breakpoint lg)
- Conteúdo centralizado horizontalmente, largura controlada por container.
- Headline em 2 linhas com quebra após "uma".
- Card do contador em linha única: 4 unidades lado a lado, separadas por divisores verticais.
- Card ocupa ~45–50% da largura do container.

### Tablet (breakpoint md)
- Headline mantém 2 linhas (quebra pode mudar conforme largura).
- Card do contador permanece em linha única; pode ocupar maior porcentagem da largura.
- Estrelas amarelas decorativas mantidas, possivelmente em menor quantidade ou reposicionadas.

### Mobile (< breakpoint md)
- Headline pode ocupar 3+ linhas; quebra livre.
- Card do contador: **manter as 4 unidades em linha** se houver espaço; caso contrário, considerar redução proporcional dos números/labels antes de quebrar em duas linhas. Quebra em duas linhas (2x2) é fallback aceitável.
- Divisores verticais entre unidades podem ser ocultados em mobile se houver quebra em grid 2x2.
- Padding lateral da seção reduzido conforme tokens mobile.
- Estrelas decorativas: reduzir quantidade visível ou diminuir tamanho para evitar poluição visual.
- Rodapé com disclaimer pode quebrar em múltiplas linhas naturalmente.

### Comportamentos transversais
- Background espacial cobre 100% da seção em todos os breakpoints.
- Nenhum elemento textual deve ser cortado horizontalmente.
- Card do contador nunca deve transbordar a viewport.

---

## 8. Contrato JS (contador)

Contrato obrigatório que a implementação deve seguir.

### Atributos
- **`data-target-date`** no container do card do contador.
  - Valor: data/hora alvo da estreia, em formato ISO 8601 (sugerido: `"2026-12-25T00:00:00"` — ajustar conforme fuso definido pelo time).
  - Placeholder no spec: `[DATA_DA_ESTREIA]`.

- **`data-countdown`** em cada `<span>` que exibe um valor numérico, com um destes valores:
  - `data-countdown="days"`
  - `data-countdown="hours"`
  - `data-countdown="minutes"`
  - `data-countdown="seconds"`

### Valores iniciais
- O conteúdo de texto inicial de cada span é literalmente `"00"` no HTML estático.
- O JS substitui esses valores ao iniciar e atualiza a cada segundo.

### Comportamento esperado do JS (descritivo, não implementação)
1. Ao carregar, ler `data-target-date` do container.
2. Calcular diferença entre `Date.now()` e a data alvo.
3. Decompor em dias, horas, minutos e segundos restantes.
4. Atualizar cada span correspondente, formatando com **padding zero à esquerda** (ex.: "09", não "9"). Dias podem exceder 2 dígitos (ex.: "244").
5. Atualizar a cada 1 segundo (1000ms).
6. Quando a data alvo for atingida ou ultrapassada: todos os valores devem ser `"00"`. Comportamento pós-estreia (mensagem alternativa, esconder card, etc.) **não está definido neste spec** — confirmar com design.

### Fora do contrato
- Animações de transição entre números (flip, fade) não são obrigatórias. Se implementadas, devem respeitar tokens de animação do DESIGN.md.
- Persistência, fuso horário do usuário vs. fuso fixo: definir com o time antes da implementação.

---

## 9. Checklist de implementação

Itens verificáveis durante o desenvolvimento.

### Estrutura
- [ ] Seção tem semântica HTML apropriada (`<section>`, headings na ordem correta).
- [ ] Headline usa `<span>` para isolar palavras destacadas ("estrela", "agora.").
- [ ] Card do contador tem `data-target-date="[DATA_DA_ESTREIA]"`.
- [ ] Cada uma das 4 unidades tem `<span data-countdown="...">` com valor inicial `"00"`.
- [ ] Labels do contador na ordem: DIAS, HORAS, MIN, SEG.
- [ ] Texto "Dia 25 de Dezembro, 2026" presente abaixo do card.
- [ ] Rodapé com nome do projeto + disclaimer presente.

### Conteúdo
- [ ] Headline com acentuação correta ("história", "começa") — confirmar com design.
- [ ] Sublinha em caixa alta com letter-spacing amplo.
- [ ] Disclaimer completo, sem truncamento.

### Estilo
- [ ] Cores, tipografia, espaçamentos, raios e sombras consumidos exclusivamente do DESIGN.md.
- [ ] Nenhum valor de cor/px/rem hardcoded fora dos tokens.
- [ ] Background espacial cobre toda a seção.
- [ ] Estrelas amarelas decorativas posicionadas conforme mapeamento.
- [ ] Divisores verticais entre unidades do contador presentes em desktop.

### Responsividade
- [ ] Desktop: card em linha única, 4 unidades lado a lado.
- [ ] Mobile: card sem transbordo; quebra 2x2 aceitável como fallback.
- [ ] Headline não corta em nenhum breakpoint.
- [ ] Estrelas decorativas não bloqueiam leitura do texto.

### Contador (JS)
- [ ] `data-target-date` lido corretamente do DOM.
- [ ] Atualização a cada 1 segundo.
- [ ] Padding zero à esquerda nos valores de horas, minutos e segundos.
- [ ] Dias suportam números com mais de 2 dígitos.
- [ ] Comportamento na data zero ou ultrapassada definido.

### Acessibilidade
- [ ] Imagens decorativas marcadas como `aria-hidden` ou com `alt=""`.
- [ ] Hierarquia de headings sem pulos.
- [ ] Contraste de texto sobre o background espacial conforme WCAG AA (validar tokens).
- [ ] Contador legível por leitor de tela: considerar `aria-live` ou alternativa textual descritiva.

---

## 10. Critérios de aceitação

A seção é aprovada quando:

1. **Visual:** corresponde ao print de referência (desktop) em layout, hierarquia e proporção, com tokens do DESIGN.md aplicados.
2. **Conteúdo:** todos os textos do inventário (§2) presentes, com a grafia acordada com design (acentuação resolvida).
3. **Contador:** atualiza dinamicamente a cada segundo, lê `data-target-date`, e exibe valores iniciais "00" enquanto o JS não executou.
4. **Responsividade:** funciona sem quebras visuais nos breakpoints definidos no DESIGN.md (desktop, tablet, mobile).
5. **Contrato JS:** atributos `data-target-date` e `data-countdown` presentes exatamente como especificado em §8.
6. **Tokens:** auditoria visual confirma que nenhum valor de cor/espaçamento/tipografia foi hardcoded fora dos tokens.
7. **Acessibilidade:** seção passa em validação básica (contraste, hierarquia de headings, elementos decorativos ocultos para leitores de tela).
8. **Sem invenção:** nenhum elemento fora do inventário (§2) foi adicionado (ex.: CTAs, formulários, links).

---

*Fim do spec.*