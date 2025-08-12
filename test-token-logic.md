# 🧪 Teste da Lógica de Tokens iFood

## 🎯 Como o Sistema Funciona

O sistema implementa a seguinte lógica:

1. **Verifica se já existe token válido** para o `client_id`
2. **Se existe e não expirou** → Retorna o token existente
3. **Se não existe ou expirou** → Gera novo token do iFood
4. **Salva o novo token** no banco (substitui o anterior)

Vamos testar cada cenário...