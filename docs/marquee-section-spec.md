# Spec: Marquee Section

## Objetivo
Especificar a implementação do componente de faixa contínua (marquee) localizado acima da seção de personagens. O objetivo é criar um letreiro rotativo com alto contraste que reforce o tom cinematográfico e traga dinamismo para a interface, alinhado ao `DESIGN.md`.

## Inventário Visual
Com base na análise do print:
* **Textos presentes (em ordem):** SUPER MARIO GALAXY, NOS CINEMAS, UMA AVENTURA PELO COSMOS, MARIO, LUIGI, ROSALINA, e a letra "P".
* **Separadores:** Símbolo de barra oblíqua (`/`) isolando cada bloco de texto.
* **Tipografia:** Letras maiúsculas (caixa alta), com peso de fonte encorpado.
* **Fundo:** Faixa horizontal sólida na cor roxa.

## Estrutura HTML
* **Container Principal (`<aside>` ou `<section>`):** Atua como a máscara que esconde o que transborda (`overflow: hidden`).
* **Track de Animação:** Container interno (ex: `<div>` com `display: flex`) onde a animação de deslocamento horizontal é aplicada.
* **Lista de Itens:** Elementos semânticos agrupando os textos e as barras de forma sequencial.
* *Acessibilidade:* Recomenda-se adicionar `aria-hidden="true"` nos blocos de itens clonados usados para criar o efeito infinito, evitando leitura duplicada excessiva em leitores de tela.

## Camadas
1. **Background Layer:** Preenchimento de fundo de ponta a ponta na cor de acento.
2. **Content Layer:** Textos e separadores organizados horizontalmente em linha única, em alto contraste e com espaçamento uniforme.
3. **Container/Boundary Layer:** O limite da viewport ou container pai que cria o recorte das laterais.

## Tokens (Baseado no DESIGN.md)
* **Fundo:** `--cosmic-purple` (`#6a3cbc`)
* **Texto e Separadores:** `--text-primary` (`#f5f0e8`)
* **Tipografia (Família):** `--font-body` (`Outfit`, sans-serif)
* **Tipografia (Estilo):** Caixa alta com tracking leve (conforme "Utility labels"), peso 700 ou 900 (Hierarchy).

## Suposições
* A letra "P" parcialmente cortada no extremo direito indica que este é um componente animado "Marquee" (looping horizontal), onde os textos entram na tela continuamente.
* Assume-se que o movimento padrão será contínuo, da direita para a esquerda.
* A barra preta vertical em uma das extremidades da imagem assume-se ser um artefato do print ou do limite do site original, não uma borda desenhada do componente em si.

## Responsividade
* **Desktop:** A faixa deve ocupar 100% da largura da tela (`width: 100vw`) ou do grid estabelecido no layout.
* **Mobile (< 768px):** A estrutura fundamental de linha única (scroll horizontal) permanece. Em telas menores, a escala de fonte e o espaçamento lateral entre os itens devem ser reduzidos de forma fluida (usando `clamp(...)`), mantendo o layout sem quebrar linha.

## Comportamento
* **Movimento:** Deslocamento horizontal contínuo e infinito (`infinite linear`).
* **Performance:** A animação deve utilizar as propriedades de transformação recomendadas no DESIGN.md (preferencialmente `transform: translateX(...)` e animação CSS via `@keyframes`) para garantir desempenho.
* **Transição Oculta:** O recomeço da lista (quando o clone entra) deve encaixar de forma matemática para não causar um pulo perceptível aos olhos.

## Checklist
- [ ] A cor de fundo mapeia corretamente para `--cosmic-purple`?
- [ ] A cor do texto mapeia para `--text-primary`?
- [ ] A família tipográfica está aplicada usando `--font-body`?
- [ ] Os elementos de texto utilizam `text-transform: uppercase`?
- [ ] O espaçamento (`gap` ou `padding`) entre as palavras e as barras divisórias é perfeitamente simétrico?
- [ ] A animação do letreiro é suave e não apresenta "stuttering" ou interrupções no final do loop?

## Critérios Visuais
* **Alinhamento:** Todo o conteúdo textual e divisores deve ser perfeitamente centralizado no eixo vertical (`align-items: center`) dentro da altura da faixa.
* **Kerning/Tracking:** Seguir as diretrizes do DESIGN.md aplicando leve `letter-spacing` para adequar os utility labels e melhorar a legibilidade das caixas altas.
* **Densidade Equilibrada:** Respeitar a diretriz de "5/10 (equilibrado)", mantendo um respiro confortável em torno das palavras para não poluir o rastro visual enquanto a fita se move.
