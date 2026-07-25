# Especificação da Hero Section: Super Mario Galaxy

## 1. Objetivo
Definir a estrutura, os ativos e o estilo da seção Hero do projeto "Super Mario Galaxy: O Filme", baseando-se estritamente nos prints fornecidos como única fonte da verdade e alinhando-se aos tokens do `DESIGN.md`. Nenhuma adição visual ou de conteúdo estrutural não contida nos prints é permitida.

## 2. Inventário Visual
Lista exata de todos os elementos visíveis no print, sem acréscimos:
- **1 Badge superior**: Texto "NOS CINEMAS AGORA" dentro de um contêiner em formato de pílula (pill).
- **1 Título principal**: Dividido em duas linhas. Linha 1: "Super Mario". Linha 2: "Galaxy: O Filme".
- **1 Subtítulo/Tagline**: Texto "UMA AVENTURA ÉPICA PELO COSMOS".
- **1 Botão CTA**: Fundo roxo com o texto "Assistir Trailer" e um ícone circular contendo um símbolo de "play".
- **1 Indicação de rolagem**: Texto "ROLE PARA EXPLORAR" localizado na parte inferior central.
- **1 Vídeo de personagem (Esquerda)**: Mario astronauta flutuando.
- **1 Vídeo de personagem (Direita)**: Yoshi astronauta flutuando (apresenta um fundo preto no print, indicando área de vídeo, a ser resolvido pelo alpha channel).
- **1 Vídeo de cenário (Centro/Baixo)**: Um planeta realista (estilo Terra) com nuvens, ocupando a base da tela.
- **3 Elementos decorativos (Estrelas/Lumas)**: 
  - 1 estrela no canto inferior esquerdo.
  - 1 estrela no canto inferior direito.
  - 1 estrela no centro inferior (sobreposta ao planeta/abaixo do texto de rolagem).

## 3. Estrutura HTML (Árvore e Classes)
Espelhando o inventário visual. Todas as classes seguem nomenclatura semântica (BEM) ou utilitária com base no CSS fornecido.

```html
<section class="hero">
  <div class="hero__media-layer">
    <video class="hero__mario" autoplay loop muted playsinline>
      <source src="assets/images/mario-clip-alpha.webm" type="video/webm">
      <source src="assets/images/mario-clip-min.mp4" type="video/mp4">
    </video>
    
    <video class="hero__yoshi" autoplay loop muted playsinline>
      <source src="assets/images/yoshi-video-alpha.webm" type="video/webm">
      <source src="assets/images/yoshi-video-min.mp4" type="video/mp4">
    </video>
    
    <video class="hero__planet" autoplay loop muted playsinline>
      <source src="assets/images/planet-3d-alpha.webm" type="video/webm">
      <source src="assets/images/planet-3d-min.mp4" type="video/mp4">
    </video>

    <img class="hero__star hero__star--left" src="assets/images/estrela-min.webp" alt="" aria-hidden="true">
    <img class="hero__star hero__star--right" src="assets/images/estrela-min.webp" alt="" aria-hidden="true">
    <img class="hero__star hero__star--center" src="assets/images/estrela-min.webp" alt="" aria-hidden="true">
  </div>

  <div class="hero__content-layer">
    <div class="hero__badge">NOS CINEMAS AGORA</div>
    
    <h1 class="hero__title">
      <span class="hero__title-line1">Super Mario</span>
      <span class="hero__title-line2">Galaxy: O Filme</span>
    </h1>
    
    <p class="hero__subtitle">UMA AVENTURA ÉPICA PELO COSMOS</p>
    
    <button class="hero__cta">
      Assistir Trailer
      <span class="hero__cta-icon"></span> </button>
  </div>

  <div class="hero__scroll-indicator">
    <span class="hero__scroll-text">ROLE PARA EXPLORAR</span>
  </div>
</section>
```

## 4. Camadas Visuais

* **Fundo (`z-index: -2`)**: Utiliza o token `--bg-deep` definido no arquivo de estilos para garantir o preto cósmico profundo.
* **Mídias e Orbitais (`z-index: -1` a `1`)**: Vídeos do Mario, Yoshi, Planeta e as três Estrelas, posicionados de forma absoluta no container pai (`position: relative`). O Planeta deve ficar atrás do texto e das estrelas centrais, mas os personagens flutuam nas extremidades laterais.
* **Conteúdo Central (`z-index: 10`)**: Elementos textuais e CTA, empilhados verticalmente no centro da tela (`display: flex; flex-direction: column; align-items: center`).

## 5. Tokens (Referenciando :root)

* **Fundo Global**: `--bg-deep` (`#000000`).
* **Fontes**: `--font-display` para os títulos, `--font-body` para demais textos (`Outfit`).
* **Cores de Texto**:
* Título linha 1 ("Super Mario"): `--text-primary` (`#f5f0e8`).
* Título linha 2 ("Galaxy: O Filme"): `--accent-star` (`#ffd23f`).
* Badge text: `--accent-star` (`#ffd23f`).
* Subtítulo: `--text-muted` (faint/transparente).


* **Cores de Componentes**:
* Botão CTA (Fundo): `--cosmic-purple` (`#6a3cbc`).
* Badge (Fundo/Borda): `--accent-star-dim` e possível borda/glow interno baseado nos tokens cósmicos.


* **Animações (Transições e Easing)**: `--ease-out-expo` para eventuais hovers, e `--ease-spring` para a flutuação dos componentes.

## 6. Assets Mapeados (Uso Obrigatório)

Conforme as restrições contratuais do projeto:

1. **Mario** (Posição: Meio/Esquerda flutuante):
* `assets/images/mario-clip-alpha.webm` (video/webm)
* `assets/images/mario-clip-min.mp4` (video/mp4)


2. **Yoshi** (Posição: Meio/Direita flutuante - **Requer `transform: scaleX(-1)` no CSS**):
* `assets/images/yoshi-video-alpha.webm` (video/webm)
* `assets/images/yoshi-video-min.mp4` (video/mp4)


3. **Planeta** (Posição: Base/Centro girando):
* `assets/images/planet-3d-alpha.webm` (video/webm)
* `assets/images/planet-3d-min.mp4` (video/mp4)


4. **Lumas/Estrelas** (Posição: 1 na esquerda, 1 na direita, 1 no centro embaixo):
* `assets/images/estrela-min.webp` (Aplicado em 3 tags `<img>` distintas).



*Nota: Todas as tags de `<video>` devem imperativamente possuir os atributos `autoplay loop muted playsinline` e omitir `controls`.*

## 7. Suposições a Confirmar

* **Fundo do Yoshi**: No print, o vídeo do Yoshi possui um retângulo preto sólido por trás. Supõe-se que o uso correto do arquivo `.webm` com canal alpha resolverá essa transparência, mesclando-o com o `--bg-deep`.
* **Cursor na Estrela Central**: No print, existe um cursor de mouse padrão em cima da estrela inferior central. Supõe-se que seja um artefato do printscreen e não parte integrante do UI design. O spec omite o desenho do cursor de mouse na UI estrutural.
* **Cor do ícone de Play no CTA**: O ícone no print é muito pequeno, parece um círculo claro (branco ou `--text-primary`) com um triângulo interno (`--cosmic-purple`).
* **Peso das fontes**: Presumivelmente, "Super Mario Galaxy: O Filme" utiliza `--fw-black` ou `--fw-extrabold`, enquanto o subtítulo usa `--fw-medium` ou `--fw-regular`.

## 8. Responsividade

* **Desktop (Print)**: Layout simétrico (personagens nas margens, conteúdo ao centro). Assimetria moderada contida.
* **Mobile (< 768px)**:
* Colapso para coluna única.
* Mario e Yoshi devem ser reposicionados (ou escalados significativamente) para evitar sobreposição excessiva ao texto central.
* O Planeta deve reduzir seu tamanho ou ser deslocado mais para baixo para liberar área de toque e visualização textual.
* Largura do contêiner contida pelos espaçamentos laterais (`--space-gutter-x`).



## 9. Comportamentos

* **Estático**: Posições definidas pelas âncoras na tela (`absolute` com margens fixas ou flexbox estruturado).
* **Flutuação**: Pode-se prever uma animação CSS sutil (`transform: translateY`) nos vídeos do Mario e Yoshi para emular gravidade zero.
* **Parallax-ready**: Os vídeos isolados com canal alpha permitem aplicar facilmente efeitos de movimentação no scroll no futuro.

## 10. Checklist de Implementação

* [ ] O arquivo `DESIGN.md` e suas variáveis do `:root` estão devidamente importadas.
* [ ] A tag HTML da Hero reflete estritamente a hierarquia do spec (sem divs, containers, ou textos fantasmas não presentes no print).
* [ ] Conferir o comportamento do arquivo de vídeo do Yoshi (se a transparência do alpha está funcionando).
* [ ] Garantir o CSS `transform: scaleX(-1)` na classe do Yoshi para espelhá-lo como mostra no print (olhando para o centro).
* [ ] Confirmar paths exatos (`assets/images/mario-clip-alpha.webm`, etc.) em todas as tags `<source>`.
* [ ] Testar a hero renderizada contra navegadores baseados em WebKit/Safari para checar o fallback do `.mp4` caso haja problema no `.webm`.

## 11. Critérios de Aceitação Visuais

* A hero renderizada precisa se sobrepor de maneira idêntica (pixel-perfect alignment para a escala central) à imagem `desktop-print-hero-section.jpg`.
* Nenhuma string nova introduzida, a não ser as pontuadas na seção de inventário visual.
* A paleta de cores responde exclusivamente às variáveis CSS do sistema de design (ex: o CTA deve puxar `--cosmic-purple` e o título inferior `--accent-star`).
