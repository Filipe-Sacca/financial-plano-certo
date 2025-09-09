# Merchant

- **Listar Lojas** fazendo requests no endpoint GET [/merchants](https://developer.ifood.com.br/pt-BR/docs/references#operations-Merchant-getAllMerchants).
- **Listar detalhes da loja** fazendo requests no endpoint GET [/merchants/{merchantId}](https://developer.ifood.com.br/pt-BR/docs/references#operations-Merchant-getMerchant). O resultado esperado é chamar o endpoint com algum merchant da lista retornado pelo endpoint GET [/merchants](https://developer.ifood.com.br/pt-BR/docs/references#operations-Merchant-getAllMerchants).
- **Listar status da loja** fazendo requests no endpoint GET [/merchants/{merchantId}/status](https://developer.ifood.com.br/pt-BR/docs/references#operations-Status-getAllStatusDetails).
- **Criar uma interrupção** fazendo requests no endpoint POST [/merchants/{merchantId}/interruptions](https://developer.ifood.com.br/pt-BR/docs/references#operations-Interruption-postInterruption).
- **Listar uma interrupção** fazendo requests no endpoint GET [/merchants/{merchantId}/interruptions](https://developer.ifood.com.br/pt-BR/docs/references#operations-Interruption-getInterruption).
- **Remover uma interrupção** fazendo requests no endpoint DELETE [/merchants/{merchantId}/interruptions/{interruptionId}](https://developer.ifood.com.br/pt-BR/docs/references#operations-Interruption-deleteInterruption).
- **Listar horário de funcionamento** fazendo requests no endpoint GET [/merchants/{merchantId}/opening-hours](https://developer.ifood.com.br/pt-BR/docs/references#operations-OpeningHours-getOpeningHours)
- **Criar horário de funcionamento** fazendo requests no endpoint PUT [/merchants/{merchantId}/opening-hours](https://developer.ifood.com.br/pt-BR/docs/references#operations-OpeningHours-putOpeningHours)

# Módulo de Pedidos

- Receber eventos de pedidos via polling ou via webhook.
    - No caso do polling:
        - Fazer requests no endpoint de [/polling](https://developer.ifood.com.br/pt-BR/docs/references#operations-Events-getOrderEvents) regularmente a cada 30 segundos para não perder nenhum pedido. Isso garante que o [merchant fique aberto na plataforma](https://medium.com/ifood-developer/status-de-conex%C3%A3o-dos-parceiros-no-ifood-aa010fec7713); Utilize o header `x-polling-merchants` sempre que precisar filtrar eventos de um ou mais merchants. Também é possível filtrar os eventos que deseja receber por tipo e por grupo;
        - Enviar [/acknowledgment](https://developer.ifood.com.br/pt-BR/docs/references#operations-Events-acknowledgeEvents) para **todos** os eventos recebidos (com status code 200) após garantir que foram processados corretamente no seu sistemas, evitando perda de dados;
        - Limitar em até **2000 IDs** de eventos nas requests de [/acknowledgment](https://developer.ifood.com.br/pt-BR/docs/references#operations-Events-acknowledgeEvents), dividir em várias requisições, se necessário.
    - No caso do webhook: responder com sucesso às requests do webhook, verificado por nossa auditoria interna;
- Importar o pedido via endpoint [virtual-bag](https://developer.ifood.com.br/pt-BR/docs/guides/order/groceries/virtual-bag) no status [SPE](https://developer.ifood.com.br/pt-BR/docs/guides/order/events#eventos-por-grupo);
- Atualizar o status de um pedido que pode ter sido cancelado pelo cliente ou pelo iFood;
- Descartar eventos duplicados no polling, caso esse evento tenha sido entregue mais de uma vez.

Integradoras que utilizam ferramenta própria ou de terceiros para fazer a gestão de pedido, o aplicativo também deve ser capaz de:

- Cancelar um pedido através do endpoint [/requestCancellation](https://developer.ifood.com.br/pt-BR/docs/references/#operations-Actions-requestCancellation) informando um dos códigos/motivos disponíveis para o momento do pedido, e esta lista de códigos/motivos deverá ser obtida através do endpoint [/cancellationReasons](https://developer.ifood.com.br/pt-BR/docs/references/#operations-Actions-getCancellationReasons) e disponibilizada no sistema de PDV, para o usuário escolher qual motivo usar;
- Informar o CPF/CNPJ na tela caso seja obrigatório pela loja ou já preencher no documento fiscal automaticamente.

Requisitos não funcionais:

- Renovar o token somente quando estiver prestes a expirar ou imediatamente após a expiração.
- O aplicativo deve respeitar as políticas de rate limit de cada endpoint.


# Eventos

- Enviar requests no endpoint [GET /events:polling](https://developer.ifood.com.br/pt-BR/docs/references#operations-Events-getOrderEvents) a cada 30 segundos para não perder pedidos.
- Usar o header `x-pooling-merchants` para filtrar eventos por merchant.
- Filtrar eventos também por tipo e grupo, se necessário.
- Enviar[POST /events/acknowledgment](https://developer.ifood.com.br/pt-BR/docs/references#operations-Events-acknowledgeEvents) para todos os eventos recebidos (código 200) imediatamente após a request de pooling.
- Para aplicativos de **Integradora Logística**, é obrigatório enviar o parâmetro `excludeHeartbeat=true` ao realizar uma requisição no endpoint [GET /events:polling](https://developer.ifood.com.br/pt-BR/docs/references#operations-Events-getOrderEvents). Isso é necessário para evitar que a loja seja aberta, causando cancelamento de pedidos e posteriormente evitando que o merchant seja penalizado na plataforma, por mau uso do módulo. Saiba mais em [Status de Conexão dos Parceiros no iFood](https://medium.com/ifood-developer/status-de-conex%C3%A3o-dos-parceiros-no-ifood-aa010fec7713).


# CATALOG

- **Listar catálogos** fazendo requests no endpoint GET [/merchants/{merchantId}/catalogs](https://developer.ifood.com.br/pt-BR/docs/references#operations-Catalog-CatalogController_getCatalogs).
- **Listar categorias** fazendo requests no endpoint GET [/merchants/{merchantId}/catalogs/{catalogId}/categories](https://developer.ifood.com.br/pt-BR/docs/references#operations-Category-CategoryController_getAllCategories).
- **Criar uma categoria** fazendo requests no endpoint POST [/merchants/{merchantId}/catalogs/{catalogId}/categories](https://developer.ifood.com.br/pt-BR/docs/references#operations-Category-CategoryController_createCategory).
- **Criar e editar um item completo** fazendo requests no endpoint PUT [/merchants/{merchantId}/items](https://developer.ifood.com.br/pt-BR/docs/references#operations-Item-ItemController_createOrUpdateItem).
- **Alterar preço de um item** fazendo requests no endpoint PATCH [/merchants/{merchantId}/items/price](https://developer.ifood.com.br/pt-BR/docs/references#operations-Item-ItemController_updateItemPrice).
- **Alterar status de um item** fazendo requests no endpoint PATCH [/merchants/{merchantId}/items/status](https://developer.ifood.com.br/pt-BR/docs/references#operations-Item-ItemController_updateItemStatus).
- **Alterar preço de um complemento** fazendo requests no endpoint PATCH [/merchants/{merchantId}/options/price](https://developer.ifood.com.br/pt-BR/docs/references#operations-Option-OptionController_updateOptionPrice).
- **Alterar status de um complemento** fazendo requests no endpoint PATCH [/merchants/{merchantId}/options/status](https://developer.ifood.com.br/pt-BR/docs/references#operations-Option-OptionController_updateOptionStatus).
- **Fazer upload de imagens** fazendo requests no endpoint POST [/merchants/{merchantId}/image/upload](https://developer.ifood.com.br/pt-BR/docs/references#operations-Image-ImageController_uploadImage).
- Será solicitado uma evidência do cardápio configurado, apresentando a imagem do item, nome, descrição e valor.

# ITEM

- Integrar novos itens, alterar todas as informações ou reativar item fazendo requests no endpoint POST /item/v1.0/ingestion/{merchantId}?reset=false
- Alterar informações parciais de itens fazendo requests no endpoint PATCH item/v1.0/ingestion/{merchantId}


# Picking

O aplicativo deve ser capaz de:

- Iniciar a separação de um pedido usando a rota `POST /startSeparation`
- Adicionar um item do pedido usando a rota `POST /orders/:id/items`
- Editar um item do pedido usando a rota `PATCH /orders/:id/items/:uniqueId`
- Deletar um item do pedido usando a rota `DELETE /orders/:id/items/:uniqueId`
- Finalizar a separação de um pedido usando a rota `POST /endSeparation`

Requisitos não funcionais:

- Renovar o token somente quando estiver prestes a expirar ou imediatamente após a expiração.
- O aplicativo deve respeitar as políticas de rate limit de cada endpoint.
- O aplicativo nunca deve finalizar a separação ou tentar fazer uma alteração antes de iniciar a separação.
- O aplicativo nunca deve tentar alterar itens após a conclusão da separação.
- O aplicativo deve sempre consultar novamente os detalhes do pedido após a conclusão da separação para obter a versão atualizada que reflita as edições realizadas.

# Promotion

O aplicativo deve ser capaz de:

- Criar promoção
    - Fazer requisição no endpoint de [/promotions](https://developer.ifood.com.br/pt-BR/docs/references#operations-Promotion-createPromotion)
        - Ao realizar uma requisição no endpoint, deverá ser retornado um HTTP status code 202 e posteriormente as promoções serão enviadas ao APP.
        - Response body de sucesso.
            
            ```
            {"aggregationId": "String","message": "We have successfully received your request to create promotions"}
            ```


# Shipping

## O aplicativo deve ser capaz de

- Fazer requests no endpoint de [/polling](https://developer.ifood.com.br/pt-BR/docs/references#operations-Events-getOrderEvents) regularmente a cada 30 segundos;
- Enviar [/acknowledgment](https://developer.ifood.com.br/pt-BR/docs/references#operations-Events-acknowledgeEvents) para todos os eventos recebidos imediatamente após a request de polling;
- **Receber e confirmar um pedido Sob Demanda** para agora **(orderType = DELIVERY / orderTiming = IMMEDIATE / salesChannel = POS)**;
- **Receber e cancelar** um pedido delivery para agora **(orderType = DELIVERY / orderTiming = IMMEDIATE / salesChannel = POS)**. Antes de solicitar um cancelamento é obrigatório a consulta dos códigos/motivos disponíveis para o momento do pedido através do endpoint [/cancellationReasons](https://developer.ifood.com.br/pt-BR/docs/references#operations-Actions-requestCancellation), esta lista de códigos/motivos deverá ser disponibilizada no sistema de PDV, para o usuário do PDV escolher qual motivo usar;
- Atualizar o status de um pedido cancelado pelo cliente ou pelo iFood;
- Atualizar o status de um pedido que pode ter sido confirmado/cancelado por outro aplicativo como por exemplo o Gestor de Pedidos;
- Receber um mesmo evento mais de uma vez no polling e descartá-lo caso esse evento tenha sido entregue mais de uma vez;
- Aceitar ou rejeitar uma alteração de endereço.
- Deve ser capaz de verificar o código de coleta e saber se o código foi validado.



