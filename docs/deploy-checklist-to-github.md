# Como criar um link compartilhável do Checklist

## Opção 1: GitHub Pages (Gratuito)
1. Crie um repositório no GitHub
2. Faça upload do arquivo `Checklist_IfoodHub.html`
3. Ative GitHub Pages nas configurações
4. Seu link será: `https://seu-usuario.github.io/nome-repo/Checklist_IfoodHub.html`

## Opção 2: Google Drive
1. Faça upload do PDF para o Google Drive
2. Clique com botão direito → "Obter link"
3. Configure como "Qualquer pessoa com o link pode visualizar"
4. Compartilhe o link gerado

## Opção 3: Netlify Drop (Super Rápido)
1. Acesse: https://app.netlify.com/drop
2. Arraste o arquivo HTML para a página
3. Receba instantaneamente um link público
4. Link válido por 24 horas (conta gratuita = permanente)

## Opção 4: Surge.sh (Via Terminal)
```bash
npm install -g surge
surge Checklist_IfoodHub.html
```
- Escolha um domínio (ex: ifood-checklist.surge.sh)
- Link público instantâneo!

## Opção 5: Vercel (Profissional)
```bash
npm i -g vercel
vercel Checklist_IfoodHub.html
```
- Deploy instantâneo
- Link permanente e profissional