Shipping
Envio de pedidos realizados na plataforma iFood: Este módulo permite que os merchants enviem pedidos feitos na plataforma iFood (Pedidos que já possuem um orderId). Isso é especialmente útil para merchants que possuem seus próprios entregadores, mas que podem precisar do serviço de entrega do iFood em situações de sobrecarga ou falta de entregadores.
Para utilizar esta modalidade de serviço deve ser contratado através do menu Serviços do Portal do Parceiro. Caso contrário, não será possível registrar pedidos, verificar disponibilidade de entrega ou solicitar entregador.
Elegibilidade
Esta modalidade de entrega não está disponível para qualquer pedido. O pedido só será elegível quando passar por alguns critérios como:
O merchant está em um modelo de negócio que possibilite essa solicitação (caso o merchant seja fullservice, o pedido já é entregue pela nossa logística e não é possível solicitar um entregador parceiro)
O pedido é delivery (não é possível solicitar nos pedidos Para Retirar)
A área da entrega é coberta pelos entregadores parceiros
Envio de pedidos realizados através de outros canais de venda: O módulo também permite que os merchants enviem pedidos que foram realizados através de outros canais de venda, como telefone, WhatsApp, aplicativo ou site próprio (Pedidos que não possuem um orderId pré-existente). Para maiores informações sobre o Sob Demanda, acesse https://news.ifood.com.br/entrega-facil-o-delivery-do-ifood-fora-do-app/
Definições
Pedidos na plataforma iFood e fora dela
Pedidos na plataforma iFood são aqueles que já possuem um orderId, contendo as informações necessárias do restaurante e do cliente para realizar a cotação e solicitação.
Por outro lado, pedidos fora da plataforma iFood não possuem um orderId pré-existente, pois não são originados internamente. Nesse caso, informações adicionais são necessárias para efetuar a cotação e solicitação.
Contratação do serviço
Para utilizar o módulo, o Sob Demanda deve ser contratado através do menu Serviços do Portal do Parceiro. Caso contrário, não será possível registrar pedidos, verificar disponibilidade de entrega ou solicitar entregador.
Critérios para homologação
Para realizar a homologação de aplicativo é necessário que o mesmo já esteja pronto. Os testes são feitos no APP como um todo e não apenas nas chamadas de nossas APIs.
Pedidos de homologação com cadastros de conta Pessoal/Estudante (CPF) não serão aceitos. Apenas pedidos com cadastro de conta Profisional (CNPJ).
Esses critérios são aplicáveis somente para integradoras que desejam integrar exclusivamente com o módulo Shipping ao contratar serviços de entrega para pedidos fora da plataforma iFood. Para as integradoras que desejam utilizar também o módulo de Orders, aplica-se o critério de homologação de Orders.
Para aquelas que já estão homologadas, apesar de não ser obrigatória, recomenda-se que para utilizar o módulo Shipping a homologação também seja feita, a fim de validar se as requisições estão sendo feitas corretamente e detectar eventuais problemas.
O aplicativo deve ser capaz de
Fazer requests no endpoint de /polling regularmente a cada 30 segundos;
Enviar /acknowledgment para todos os eventos recebidos imediatamente após a request de polling;
Receber e confirmar um pedido Sob Demanda para agora (orderType = DELIVERY / orderTiming = IMMEDIATE / salesChannel = POS);
Receber e cancelar um pedido delivery para agora (orderType = DELIVERY / orderTiming = IMMEDIATE / salesChannel = POS). Antes de solicitar um cancelamento é obrigatório a consulta dos códigos/motivos disponíveis para o momento do pedido através do endpoint /cancellationReasons, esta lista de códigos/motivos deverá ser disponibilizada no sistema de PDV, para o usuário do PDV escolher qual motivo usar;
Atualizar o status de um pedido cancelado pelo cliente ou pelo iFood;
Atualizar o status de um pedido que pode ter sido confirmado/cancelado por outro aplicativo como por exemplo o Gestor de Pedidos;
Receber um mesmo evento mais de uma vez no polling e descartá-lo caso esse evento tenha sido entregue mais de uma vez;
Aceitar ou rejeitar uma alteração de endereço.
Deve ser capaz de verificar o código de coleta e saber se o código foi validado.
Requisitos não funcionais
Renovar o token somente quando estiver prestes a expirar ou imediatamente após a expiração.
O aplicativo deve respeitar as políticas de rate limit de cada endpoint.
Desejável
A comanda impressa seguir o modelo sugerido na documentação é um requisito desejável.
Informar na tela e/ou comanda impressa a informação de indicar qualquer observação sobre a entrega do pedido (que vem no campo delivery.observations)
Entrega de pedidos
Rastrear entregador
Informações do entregador
Os detalhes do entregador são entregues através do evento ASSIGN_DRIVER.
Rastreio do pedido
É possível rastrear a entrega do pedido através do endpoint /tracking. Além da posição, retorna também o pickupEtaStart e deliveryEtaEnd. Com essas informações o usuário do seu aplicativo, além de ter mais transparência conseguirá, por exemplo, automatizar o início do preparo do pedido e otimizar sua operação.
Campo	Descrição
latitude	Latitude do entregador no momento da consulta. Pode ser null quando ainda não recebemos a posição do entregador.
longitude	Longitude do entregador no momento da consulta. Pode ser null quando ainda não recebemos a posição do entregador.
expectedDelivery	Data/hora estimada para entrega do pedido. Pode ser null quando ainda não recebemos a posição do entregador.
pickupEtaStart	Tempo estimado em segundos até a origem (coleta do pedido). Pode ser 0 ou null quando o entregador chega ao local de coleta ou negativo quando a coleta está atrasada.
deliveryEtaEnd	Tempo estimado em segundos para entrega do pedido. Pode ser 0 ou null quando o entregador chega ao local de entrega.
trackDate	Data/hora da consulta. Pode ser null quando ainda não recebemos a posição do entregador.
O rastreamento só está disponível para pedidos entregues pela logística iFood.
Disponibilidade dos dados e intervalo de consulta
Deve ser utilizado somente depois que o evento ASSIGN_DRIVER é gerado e pode ser consultado de 30 em 30 segundos. O endpoint poderá retornar 404 até que todas as informações sobre a entrega estejam disponíveis. Nesse caso você deve fazer uma nova consulta depois de 30 segundos.
Rate Limit
Em caso de mau uso, o aplicativo poderá ser bloqueado pelas políticas de rate limit e throttling.
Pedidos fora da plataforma iFood
Fluxo de integração
Client
API
Polling de Eventos
1- Disponibilidade de Entrega
GET /merchants/{merchantId}/deliveryAvailabilities
Disponibilidade e janelas de entrega
2- Registro do pedido
POST /merchants/{merchantId}/orders
Envia evento de código de confirmação
ID do pedido
3- Cancelamento do pedido
POST /orders/{orderId}/cancel
Envia evento de cancel order
Retorna solicitação aceita
Client
API
Polling de Eventos
Disponibilidade de entrega
Antes de registrar um pedido de fora do iFood, é importante consultar a disponibilidade de entrega. É possível que o endereço não esteja dentro da área de cobertura e mesmo que o endereço esteja dentro da área , é possível que exista alguma indisponibilidade temporária na região, como raio de entrega reduzido temporariamente. Através dessa consulta é possível obter também a janela de tempo estimada para a entrega do pedido para informar o cliente.
Esse passo não é obrigatório, mas realizar a consulta antes de registrar o pedido evita que erros aconteçam e permitem que a loja se planeje na preparação do pedido.
Para consultar a disponibilidade logística, basta realizar a requisição GET /deliveryAvailabilities passando os seguintes parâmetros:
merchantId - ID do merchant que irá solicitar a entrega
latitude - coordenada latitudinal do endereço de entrega
longitude - coordenada longitudinal do endereço de entrega
/shipping/v1.0/merchants/<merchantId>/deliveryAvailabilities?latitude=<latitude>&longitude=<longitude>
Respostas
Sucesso
Este endpoint retorna o http status code 200 OK caso a logística esteja disponível. O corpo da resposta contém:
id - id da cotação
expirationAt - data e hora expiração da contação UTC
createdAt - data e hora da criação da cotação UTC
quote.grossValue - valor bruto da entrega
quote.discount - valor do desconto da entrega
quote.raise - valor do acréscimo
quote.netValue - valor líquido da entrega
deliveryTime.min - tempo mínimo estimado para entrega em segundos
deliveryTime.max - tempo máximo estimado para entrega em segundos
distance - raio de distância de entrega em metros (1000, 2000, 3000...)
preparationTime - tempo de preparo em segundos
hasPaymentMethods - informa se há métodos de pagamento disponíveis
paymentMethods.id - id do método de pagamento
paymentMethods.brand - bandeira do cartão de crédito/débito
paymentMethods.liability - responsável por receber o pagamento (IFOOD)
paymentMethods.paymentType - tipo de pagamento ex.: OFFLINE
paymentMethods.method - método de pagamento CREDIT, DEBIT ou CASH
{
  "id": "57cd1046-2e06-446f-a2dd-18a518212c3c",
  "expirationAt": "2023-08-18T19:49:06Z",
  "createdAt": "2023-08-17T19:49:06Z",
  "distance": 3000,
  "preparationTime": 60,
  "quote": {
    "grossValue": 7.99,
    "discount": 0,
    "raise": 0,
    "netValue": 7.99
  },
  "deliveryTime": {
    "min": 1200,
    "max": 1800
  },
  "hasPaymentMethods": true,
  "paymentMethods": [
    {
      "id": "21c65a8c-f29e-463f-b0bd-240edeb593c4",
      "brand": "CardBrand",
      "liability": "IFOOD",
      "paymentType": "OFFLINE",
      "method": "CREDIT"
    },
    {
      "liability": "IFOOD",
      "paymentType": "OFFLINE",
      "method": "CASH",
      "id": "93c1c7c7-61f1-4dd9-bb84-62a03254701d"
    }
  ]
}
Erro
Este endpoint retorna o http status code 400 Bad Request caso a logística não esteja disponível para entregar o pedido nessa localização ou para esse merchant.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
BadRequestMerchant	Parceiro indisponível
DeliveryDistanceTooHigh	O endereço de entrega ultrapassa a área logística atendida pelo iFood
OffOpeningHours	O pedido está fora do horário de funcionamento da logística iFood
OriginNotFound	Ainda não entregamos na sua região, pois sua loja está fora da área logística do iFood
ServiceAreaMismatch	O endereço da entrega está fora da nossa área de cobertura
HighDemand	A logística iFood está temporariamente indisponível. Por favor, tente novamente mais tarde.
MerchantStatusAvailability	Restaurante com pendência, acione o Suporte
InvalidPaymentMethods	A forma de pagamento escolhida pelo cliente não é aceita pela maquininha do iFood
NRELimitExceeded	Sua loja está com muitos entregadores parceiros aguardando. Libere entregadores para que consiga solicitar a entrega Sob Demanda.
UnavailableFleet	Frota indisponível no momento.
BusyFleet	Frota ocupada no momento.
{
  "code": "DeliveryDistanceTooHigh",
  "message": "Sob Demanda indisponivel: o endereço da entrega esta a mais de 10 Km da sua loja.",
  "details": ["Delivery distance too high"]
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
{
  "code": "InternalServerError",
  "message": "Ops. Houve uma falha. Tente novamente em alguns instantes.",
  "details": ["Internal server error"]
}
Registro de pedidos
Para registrar um pedido e solicitar um entregador parceiro, basta realizar a requisição POST /orders passando no corpo as informações do pedido.
Atenção! Um entregador parceiro será alocado automaticamente após o registro com sucesso de um pedido através deste endpoint. Caso não seja possível realizar a entrega, o pedido não é registrado e é retornado um erro.
Código de Confirmação de Entrega
Para garantir a segurança das entregas evitando casos de extravio do pedido, um código de confirmação de entrega será gerado, esse código é composto pelos 4 últimos dígitos do telefone do consumidor final informado no pedido. O entregador iFood solicitará essa sequência de números ao efetuar a entrega.
Não desejo que meu pedido tenha o Código de Confirmação de Entrega
Caso não tenha acesso ao telefone do cliente ou não deseje informá-lo, será necessário enviar o customer.phone.type=”STORE” para que o código de confirmação de entrega não seja solicitado.
Como habilitar o Código de Confirmação de Entrega
Para que o pedido tenha o código de confirmação de entrega habilitado é necessário que o telefone do cliente seja informado e este telefone seja válido, pois somente assim o cliente conseguirá informar o código de confirmação de entrega correto ao entregador iFood.
Atenção! O consumidor final precisa ser informado que o entregador iFood solicitará o código de confirmação, e que esse código refere-se aos 4 últimos dígitos do seu telefone. Caso o consumidor não tenha conhecimento do código no momento da entrega o pedido será cancelado, gerando uma experiência ruim para o cliente e prejuízos para o restaurante.
Parceiros que utilizam a página de rastreio do iFood
O código de confirmação será disponibilizado na página de rastreio do iFood para que o consumidor final possa informar o código correto ao entregador iFood.
Parceiros que não utilizam a página de rastreio do iFood
Para disponibilizar o código de confirmação caso não use a página de rastreio do ifood, será necessário consumir o atributo metadata.CODE do evento DELIVERY_DROP_CODE_REQUESTED para que o código seja repassado ao consumidor final. Esse evento será propagado apenas em situações onde o código de confirmação for obrigatório, portanto caso o evento não seja enviado, significa que a confirmação de entrega não será necessária.
Atenção! Quando o código de confirmação de entrega for validado, propagaremos o evento DELIVERY_DROP_CODE_VALIDATION_SUCCESS caso esse evento não seja enviado o código não terá sido validado.
Detalhes do pedido
Seguem abaixo todos os campos do pedido para ser registrado no iFood.
Observação: Campos marcados com asterisco (*) são obrigatórios.
Nome	Tipo	Descrição
customer*	object	Dados do cliente.
customer.name*	string	Informa o nome do cliente. Formato: Livre, com limite de 50 caracteres.
customer.phone*	object	Dados do telefone do cliente.
customer.phone.type	string	Tipo do telefone do cliente, pode ser STORE/CUSTOMER. Caso não seja enviado será considerado CUSTOMER.
customer.phone.countryCode*	string	Específica o código do país. Formato: Um número de 2 dígitos. Ex: 55. Não obrigatório se o customer.phone.type é STORE.
customer.phone.areaCode*	string	Informa o código de área de uma localidade. Formato: Um número de 2 dígitos. Ex: 41. Não obrigatório se o customer.phone.type é STORE.
customer.phone.number*	string	Informa o número de telefone do cliente. Formato: Um número de 7 a 9 dígitos Ex: 995663945. Não obrigatório se o customer.phone.type é STORE.
delivery*	object	Dados de entrega do cliente.
delivery.merchantFee*	float	Taxa de cobrança realizada pelo parceiro
delivery.preparationTime	integer	Informa o tempo de preparo do pedido em segundos
delivery.quoteId	string	ID da cotação solicitada anteriormente para solicitar a entrega
delivery.deliveryAddress	object	Dados do endereço de entrega do cliente.
delivery.deliveryAddress.postalCode*	string	Informa o CEP do endereço de entrega do cliente. Formato: Um número de 8 dígitos. Ex: 82510290
delivery.deliveryAddress.streetNumber*	string	Informa o número do endereço de entrega do serviço para o cliente.
delivery.deliveryAddress.streetName*	string	Informa o nome da rua do cliente. Formato: Livre, com limite de 50 caracteres.
delivery.deliveryAddress.complement	string	Informa o complemento (bloco, apartamento, etc) do cliente. Formato: Livre, com limite de 50 caracteres.
delivery.deliveryAddress.reference	string	Informa o ponto de referência do cliente. Formato: Livre, com limite de 70 caracteres.
delivery.deliveryAddress.neighborhood*	string	Informa o bairro do endereço do cliente. Formato: Livre, com limite de 50 caracteres.
delivery.deliveryAddress.city*	string	Informa a cidade do endereço do cliente.Formato: Livre, com no mínimo 2 e no máximo 50 caracteres.
delivery.deliveryAddress.state*	string	Informa o estado do endereço do cliente. Formato: Duas letras, representando a sigla do estado correspondente. Ex: PR
delivery.deliveryAddress.country*	string	Informa o país do endereço do cliente. Formato: Duas letras Ex: BR
delivery.deliveryAddress.coordinates*	object	Dados das coordenadas do endereço
delivery.deliveryAddress.coordinates.latitude*	float	Informa a latitude do endereço do cliente.
delivery.deliveryAddress.coordinates.longitude*	float	Informa a longitude do endereço do cliente.
items*	array of objects	Dados de cada item do pedido.
items.id*	uuid	Identificação do item
items.name*	string	Informa o nome do item Formato: Livre, com limite de 50 caracteres.
items.externalCode	string	Código do item no seu aplicativo
items.quantity*	integer	Informa a quantidade do item. Valor deve ser maior que zero
items.unitPrice*	float	Representa o preço unitário de cada item. Valor deve ser maior ou igual a zero.
items.options	array of objects	Dados de complemento
items.options.id*	uuid	Informa a identificador do complemento
items.options.name*	string	Informa o nome do complemento Formato: Livre, com limite de 50 caracteres.
items.options.externalCode	string	Código do item no seu aplicativo
items.options.index*	integer	Informa o index no array das guarnições
items.options.quantity*	integer	Informa a quantidade daquela guarnição.
items.options.unitPrice*	float	Informa o preço unitário da guarnição.
items.options.price*	float	Informa o preço total da guarnição options.price = options.quantity * options.unitPrice.
items.price*	float	Informa o preço total do produto price = quantity * unitPrice. Valor deve ser maior ou igual a zero.
items.optionsPrice*	float	Informa o preço total das guarnições. Valor deve ser maior ou igual a zero.
items.totalPrice*	float	Informa o preço total totalPrice = price + optionsPrice. Valor deve ser maior ou igual a zero.
payments	object	Informa as formas de pagamento
payments.methods	array of objects	Métodos de pagamento. Obrigatório em caso de pagamento OFFLINE
payments.methods.method*	string	CREDIT, DEBIT ou CASH (somente 1 opção)
payments.methods.type*	string	Tipo de pagamento OFFLINE
payments.methods.value*	float	Valor pago através do método informado
payments.methods.card	object	Cartão de Crédito/Débito. Obrigatório caso o payment.methods.method seja CREDIT/DEBIT
payments.methods.card.brand*	string	Bandeira do cartão de Crédito/Débito
payments.methods.cash	object	Pagamento em Dinheiro. Obrigatório caso o payment.methods.method seja CASH
payments.methods.cash.changeFor*	float	Troco para quanto. Valor em dinheiro físico que o driver deverá receber.
displayId	string	Id amigável para facilitar a identificação do pedido pela loja e driver. Formato: Até 4 dígitos alfanuméricos. Ex: A4BC
metadata	object	Metadados para informações adicionais, necessário, a identificação do pedido.Ex: M3019, idPDV501248, identificadorPOS Formato: Limite de 20
metadata.prop1*	Dictionary<string, string>	Informações adicionais
Exemplos

Pedido sem complementos

Pedido completo (com código de confirmação de entrega e pagamento offline)

Pedido com Pagamento Online

Pedido com pagamento em Dinheiro

Pedido sem Código de Confirmação de Entrega
{
  "customer": {
    "name": "Customer Name",
    "phone": {
      "type": "CUSTOMER",
      "countryCode": "55",
      "areaCode": "11",
      "number": "999999999"
    }
  },
  "delivery": {
    "merchantFee": 0,
    "preparationTime": 900,
    "quoteId": "3d2a7e2c-34ad-4b72-9ee5-79cec2b482a7",
    "deliveryAddress": {
      "postalCode": "69923000",
      "streetNumber": "100",
      "streetName": "Ramal Bujari",
      "complement": "",
      "neighborhood": "Centro",
      "city": "Bujari",
      "state": "AC",
      "country": "BR",
      "reference": "Perto da padaria",
      "coordinates": {
        "latitude": -9.822159,
        "longitude": -67.948475
      }
    }
  },
  "items": [
    {
      "id": "7b956744-38f6-418a-90fa-22676b53e6d1",
      "name": "Produto Teste",
      "externalCode": "123456",
      "quantity": 1,
      "unitPrice": 1,
      "price": 1,
      "optionsPrice": 0,
      "totalPrice": 1,
      "options": []
    }
  ],
  "payments": {
    "methods": [
      {
        "method": "CREDIT",
        "type": "OFFLINE",
        "value": 1,
        "card": {
          "brand": "CardBrand"
        }
      }
    ]
  },
  "displayId": "AB3D",
  "metadata": {
    "additionalProp1": "string"
  }
}
Formas de Pagamento
Pagamentos offline o entregador irá receber o valor do pedido na entrega via maquininha do iFood ou em dinheiro a depender do método enviado, é necessário enviar o objeto de payment.
É necessário que a cotação tenha esse método de pagamento na lista de paymentMethods, caso contrário será retornado um erro.
Para pagamentos online não processamos pagamentos online, esse pagamento é arrecadado pelo Merchant, logo não é necessário o envio do objeto payment.
Tempo de Preparo
Para melhorar a eficiência e a satisfação do cliente, o campo delivery.preparationTime pode ser utilizado para indicar o tempo necessário para preparar o pedido antes da alocação do entregador. Este campo é opcional e, quando não for enviado, o modelo atual de alocação imediata será mantido.
Como utilizar o Tempo de Preparo
Sem Tempo de Preparo Informado: Se o campo delivery.preparationTime não for enviado, a alocação do entregador ocorrerá imediatamente após a confirmação do pedido, seguindo o modelo atual.
Com Tempo de Preparo Informado: Quando o campo delivery.preparationTime for enviado, a alocação do entregador será realizada apenas após o tempo de preparo especificado. Neste caso o campo delivery.preparationTime deverá ser enviado com o valor correspondente ao tempo necessário em segundos. Por exemplo, se o tempo de preparo for de 15 minutos, envie delivery.preparationTime=900. Isso permite que o restaurante tenha o tempo necessário para preparar o pedido antes que o entregador seja alocado.
Atenção! É importante que o tempo de preparo informado seja o mais preciso possível para evitar atrasos na entrega e garantir uma boa experiência para o cliente. Informar um tempo de preparo incorreto pode resultar em uma experiência ruim para o cliente e prejuízos para o restaurante, como o fechamento por acúmulo de entregadores.
Metadata
O campo metadata, permite adicionar informações complementares ao pedido, essas informações não são repassadas ao app do driver ou ao gestor de pedidos.
/shipping/v1.0/merchants/<merchantId>/orders
Respostas
Sucesso
Este endpoint retorna o http status code 202 Accepted caso o pedido seja registrado com sucesso e o entregador parceiro alocado sem problemas. O corpo da resposta contém:
id - ID do pedido criado
trackingUrl - url da página de acompanhamento do pedido
{
  "id": "522e4d7e-0ce1-44f3-8cc7-73a9f190a5e8",
  "trackingUrl": "https://meupedido.ifood.com.br/522e4d7e-0ce1-44f3-8cc7-73a9f190a5e8"
}
O pedido de fora do iFood registrado é disponibilizado no polling?
Sim. O pedido que foi registrado para ser entregue por um dos entregadores parceiros do iFood é processado pela nossa infraestrutura e disponibilizado no polling da API de Order. O campo salesChannel ="POS" identifica pedidos que foram importados e vieram de outro canal de aquisição.
É possível rastrear um pedido entregue pelo Sob Demanda?
Sim. Após o pedido ser registrado com sucesso, é retornado o ID do pedido, que pode ser consultado no endpoint de tracking da API de Order.
Erros
Este endpoint retorna o http status code 400 Bad Request caso a logística não esteja disponível para entregar o pedido ou ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
BadRequestCustomer	Cliente indisponível
BadRequestMerchant	Parceiro indisponível
DeliveryDistanceTooHigh	O endereço de entrega ultrapassa a área logística atendida pelo iFood
HighDemand	A logística iFood está temporariamente indisponível. Por favor, tente novamente mais tarde
MerchantEasyDeliveryDisabled	Serviço não habilitado
OffOpeningHours	O pedido está fora do horário de funcionamento da logística iFood
OriginNotFound	Ainda não entregamos na sua região, pois sua loja está fora da área logística do iFood
PaymentMethodNotFound	Método de pagamento não encontrado
PaymentTotalInvalid	O valor pago através do método informado não coincide com o valor total da compra (os valores de “value” e “totalPrice” não batem)
ServiceAreaMismatch	O endereço da entrega está fora da nossa área de cobertura
NRELimitExceeded	Sua loja está com muitos entregadores parceiros aguardando. Libere entregadores para que consiga solicitar a entrega Sob Demanda.
{
  "code": "DeliveryDistanceTooHigh",
  "message": "Sob Demanda indisponivel: o endereço da entrega esta a mais de 10 Km da sua loja.",
  "details": ["Delivery distance too high"]
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
{
  "code": "InternalServerError",
  "message": "Ops. Houve uma falha. Tente novamente em alguns instantes.",
  "details": ["Internal server error"]
}
Confirmação ou alteração do endereço de entrega
Através deste fluxo o cliente poderá confirmar o seu endereço ou solicitar a alteração do mesmo.
Nos casos em que houver alteração do endereço de entrega, ocorrerá um processo de validação pelo parceiro, onde será deliberada a aprovação ou recusa da solicitação.
Parceiros que utilizam a página de rastreio do iFood
Os clientes que acompanham seus pedidos por meio da página de rastreio fornecida pelo iFood têm a opção de confirmar o endereço de entrega ou solicitar a sua alteração.
Para que isso seja possível, é necessário que o pedido não tenha sido criado com o atributo customer.phone.type=”STORE”.
Pagina de rastreio
API
Client
Cliente confirma/solicita alteração de endereço
Confirmação/Solicitação de alteração de endereço
Evento DAR/DAU
Evento DAR/DAU
Aceite/Rejeite da solicitação
Parceiro aceita ou rejeita a alteração do endereço
Em caso de nenhuma ação, rejeite automatico após 15 minutos
Evento DAD/DAA
Cliente visualiza o resultado da solicitação
Evento DAD/DAA
Pagina de rastreio
API
Client
Atenção! Certifique-se de enviar o número correto do telefone do cliente, utilizado como WhatsApp, para que o código de confirmação de alteração (OTP)
seja enviado. Esse procedimento é fundamental para garantir a segurança do parceiro, do cliente e da entrega.
Parceiros que não utilizam a página de rastreio do iFood
Os parceiros que optarem por criar a sua própria experiência de confirmação ou solicitação de alteração do endereço de entrega devem
implementar os endpoints responsáveis por este fluxo.
Client
API
1 - Cliente confirma ou solicita alteração do endereço
Confirmacao/Solicitação de alteração de endereço
Evento DAR/DAU
Aceite/Rejeite da solicitação
2 - Parceiro aceita ou rejeita a alteração do endereço
2.1 - Em caso de nenhuma ação, rejeite automatico após 15 minutos
Evento DAD/DAA
Client
API
Atenção! Neste fluxo, o iFood não realiza nenhum processo de confirmação de alteração com envio de um código OTP. A responsabilidade de validar e garantir este processo fica a cargo do parceiro.
Confirmação do Endereço
Para confirmar o endereço basta realizar a requisição POST /userConfirmAddress passando os seguintes parâmetros:
orderId - ID do do pedido que terá o endereço confirmado
/shipping/v1.0/orders/<orderId>/userConfirmAddress
Respostas
Sucesso
Esse endpoint retorna HTTP Status 202, sem nada no corpo da resposta
O polling receberá um evento de DELIVERY_ADDRESS_CHANGE_USER_CONFIRMED quando a solicitação for um sucesso.
Erro
Este endpoint retorna o http status code 400 Bad Request caso os parâmetros esperados não sejam fornecidos.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
{
  "code": "BadRequest",
  "message": "Houve um problema na leitura de informações. Verifique as informações enviadas.",
  "details": ["Campo 'OrderID' deve estar no formato uuid."]
}
Este endpoint retorna o http status code 404 Not Found caso o pedido não seja encontrado, esteja concluído ou cancelado, ou tenha sido criado a mais de 8 horas.
Nome	Descrição
OrderNotFound	Pedido não encontrado
{
  "code": "OrderNotFound",
  "message": "Pedido não encontrado.",
  "details": []
}
Este endpoint retorna o http status code 409 Operation Conflict caso ocorra um conflito na operação, como tentar confirmar o endereço de um
pedido com alteração pendente/confirmada/rejeitada.
Nome	Descrição
ChangeAddressOperationConflict	Conflito nas operações de alteração de endereço.
{
  "code": "ChangeAddressOperationConflict",
  "message": "Existe um conflito na confirmação/solicitação de alteração de endereço desse pedido, ela já pode ter o endereço confirmado pelo cliente, ou uma solicitação de alteração pendente/concluida",
  "details": []
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
Solicitação de alteração de endereço
Quando for solicitada uma alteração do endereço de entrega, um evento DELIVERY_ADDRESS_CHANGE_REQUESTED
será gerado e enviado por meio do polling. Este evento indica que foi solicitada a alteração do endereço, e o novo endereço solicitado estará disponível no atributo metadata.address.
Importante! Após o envio da solicitação de alteração do endereço de entrega, o parceiro terá até 15 minutos para aceitar ou rejeitar a solicitação. Caso nenhuma ação seja tomada dentro desse prazo, a solicitação será rejeitada automaticamente.
Para solicitar a alteração de endereço basta realizar a requisição POST /deliveryAddressChangeRequest passando os seguintes parâmetros:
Os parâmetros marcados com * são obrigatórios
orderId* o ID do pedido que terá o endereço confirmado
streetName* nome da rua para qual o endereço será alterado.
streetNumber número da rua para qual o endereço será alterado.
complement complemento do endereço para qual será alterado.
reference referência do endereço para qual será alterado.
neighborhood* bairro para qual o endereço será alterado.
city* cidade para qual o endereço será alterado.
state* estado para qual o endereço será alterado.
country* para qual o endereço será alterado.
coordinates* coordenadas para quais o endereço será alterado.
coordinates.latitude* latitude para qual o endereço será alterado.
coordinates.longitude* longitude para qual o endereço será alterado.
/shipping/v1.0/orders/<orderId>/deliveryAddressChangeRequest
Respostas
Sucesso
Esse endpoint retorna HTTP Status 202, sem nada no corpo da resposta
O polling receberá um evento de DELIVERY_ADDRESS_CHANGE_REQUESTED quando a solicitação for um sucesso.
Erro
Este endpoint retorna o http status code 400 Bad Request caso os parâmetros esperados não sejam fornecidos.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
MaxDistanceHigherThanAllowed	Caso a alteração de endereço passe de 500m.

BadRequest

MaxDistanceHigherThanAllowed
{
  "code": "BadRequest",
  "message": "Houve um problema na leitura de informações. Verifique as informações enviadas.",
  "details": [
    "Campo 'StreetName' é obrigatório.",
    "Campo 'Neighborhood' é obrigatório.",
    "Campo 'City' é obrigatório.",
    "Campo 'State' é obrigatório.",
    "Campo 'Country' é obrigatório.",
    "Campo 'Latitude' é obrigatório.",
    "Campo 'Longitude' é obrigatório."
  ]
}
Este endpoint retorna o http status code 404 Not Found caso o pedido não seja encontrado, esteja concluído ou cancelado, ou tenha sido criado a mais de 8 horas.
Nome	Descrição
OrderNotFound	Pedido não encontrado
{
  "code": "OrderNotFound",
  "message": "Pedido não encontrado.",
  "details": []
}
Este endpoint retorna o http status code 409 Operation Conflict caso ocorra um conflito na operação, como tentar confirmar o endereço de um
pedido com alteração pendente/confirmada/rejeitada.
Nome	Descrição
ChangeAddressOperationConflict	Conflito nas operações de alteração de endereço.
{
  "code": "ChangeAddressOperationConflict",
  "message": "Existe um conflito na confirmação/solicitação de alteração de endereço desse pedido, ela já pode ter o endereço confirmado pelo cliente, ou uma solicitação de alteração pendente/concluida",
  "details": []
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
Aprovação de alteração de endereço
Para aprovar a alteração de endereço basta realizar a requisição POST /acceptDeliveryAddressChange passando os seguintes parâmetros:
orderId - ID do do pedido que terá o endereço de entrega alterado
/shipping/v1.0/orders/<orderId>/acceptDeliveryAddressChange
Respostas
Sucesso
Esse endpoint retorna HTTP Status 202, sem nada no corpo da resposta
O polling receberá um evento de DELIVERY_ADDRESS_CHANGE_ACCEPTED quando a solicitação for um sucesso.
Erro
Este endpoint retorna o http status code 400 Bad Request caso os parâmetros esperados não sejam fornecidos.
Quando o erro tiver o nome RegionMismatch um evento DELIVERY_ADDRESS_CHANGE_DENIED será gerado automaticamente com o metadata.action="region-mismatch"
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
RegionMismatch	The new address is not in the same region as the original

BadRequest

RegionMismatch
{
  "code": "BadRequest",
  "message": "Houve um problema na leitura de informações. Verifique as informações enviadas.",
  "details": ["Campo 'OrderID' deve estar no formato uuid."]
}
Este endpoint retorna o http status code 404 Not Found caso o pedido não seja encontrado, esteja concluído ou cancelado, ou tenha sido criado a mais de 8 horas.
Nome	Descrição
OrderNotFound	Pedido não encontrado
{
  "code": "OrderNotFound",
  "message": "Pedido não encontrado.",
  "details": []
}
Este endpoint retorna o http status code 409 Operation Conflict caso ocorra um conflito na operação, como tentar confirmar o endereço de um
pedido com alteração pendente/confirmada/rejeitada.
Nome	Descrição
ChangeAddressOperationConflict	Conflito nas operações de alteração de endereço.
ChangeAddressOperationNotStarted	Não existe uma alteração de endereço pendente.

ChangeAddressOperationConflict

ChangeAddressOperationNotStarted
{
  "code": "ChangeAddressOperationConflict",
  "message": "Existe um conflito na confirmação/solicitação de alteração de endereço desse pedido, ela já pode ter o endereço confirmado pelo cliente, ou uma solicitação de alteração pendente/concluida",
  "details": []
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
Rejeição de alteração de endereço
Para rejeitar a alteração de endereço basta realizar a requisição POST /denyDeliveryAddressChange passando os seguintes parâmetros:
orderId - ID do do pedido que terá a solicitação de alteração de endereço rejeitada
/shipping/v1.0/orders/<orderId>/denyDeliveryAddressChange
Respostas
Sucesso
Esse endpoint retorna HTTP Status 202, sem nada no corpo da resposta
O polling receberá um evento de DELIVERY_ADDRESS_CHANGE_DENIED quando a solicitação for um sucesso.
Erro
Este endpoint retorna o http status code 400 Bad Request caso os parâmetros esperados não sejam fornecidos.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
{
  "code": "BadRequest",
  "message": "Houve um problema na leitura de informações. Verifique as informações enviadas.",
  "details": ["Campo 'OrderID' deve estar no formato uuid."]
}
Este endpoint retorna o http status code 404 Not Found caso o pedido não seja encontrado, esteja concluído ou cancelado, ou tenha sido criado a mais de 8 horas.
Nome	Descrição
OrderNotFound	Pedido não encontrado
{
  "code": "OrderNotFound",
  "message": "Pedido não encontrado.",
  "details": []
}
Este endpoint retorna o http status code 409 Operation Conflict caso ocorra um conflito na operação, como tentar confirmar o endereço de um
pedido com alteração pendente/confirmada/rejeitada.
Nome	Descrição
ChangeAddressOperationConflict	Conflito nas operações de alteração de endereço.
ChangeAddressOperationNotStarted	Não existe uma alteração de endereço pendente.

ChangeAddressOperationConflict

ChangeAddressOperationNotStarted
{
  "code": "ChangeAddressOperationConflict",
  "message": "Existe um conflito na confirmação/solicitação de alteração de endereço desse pedido, ela já pode ter o endereço confirmado pelo cliente, ou uma solicitação de alteração pendente/concluida",
  "details": []
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
Cancelamento
Para cancelar uma solicitação de entrega para pedidos que não são da plataforma iFood, é crucial entender algumas condições. Primeiramente, apenas os pedidos com o atributo salesChannel definido como POS podem ser cancelados. Qualquer pedido que não se enquadre neste contexto não poderá ser cancelado através do módulo de Shipping.
Para obter a lista de códigos de cancelamento válidos para um pedido, você pode usar o endpoint GET /cancellationReasons.
orderId - Id do pedido
/shipping/v1.0/orders/<orderId>/cancellationReasons
Respostas
Sucesso
Este endpoint retorna o código de status HTTP 200 OK caso o pedido possa ser cancelado, juntamente com seus possíveis códigos e descrições de cancelamento. Caso o pedido não possa mais ser cancelado, o endpoint retornará o código de status HTTP 204 No Content. O corpo da resposta contém:
cancelCodeId - código da razão do cancelamento
description - descrição da razão de cancelamento
[{
  "cancelCodeId": "817",
  "description": "O cliente cancelou o pedido pelo restaurante"
}]
Erros
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao solicitar os códigos de cancelamento da entrega.
Nome	Descrição
InternalServerError	Erro interno do servidor
{
  "code": "InternalServerError",
  "message": "Ops. Houve uma falha. Tente novamente em alguns instantes."
}
Para realizar o cancelamento, você deve fazer uma requisição para o endpoint POST /cancel, passando os seguintes parâmetros:
orderID - Id do pedido
reason - Texto com a descrição do motivo
cancellationCode - Código de cancelamento
/shipping/v1.0/orders/<orderId>/cancel
Respostas
Sucesso
Esse endpoint retorna HTTP Status 202, sem nada no corpo da resposta
O polling receberá um evento de CANCELLATION_REQUESTED quando a solicitação for um sucesso e posteriormente os eventos de CANCELLED ou CANCELLATION_REQUEST_FAILED em caso de sucesso ou falha.
Erro
Este endpoint retorna o http status code 400 Bad Request caso os parâmetros esperados não sejam fornecidos.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
{
  "code": "BadRequest",
  "message": "Houve um problema na leitura de informações. Verifique as informações enviadas.",
  "details": ["Campo 'OrderID' deve estar no formato uuid."]
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao solicitar o cancelamento da entrega.
Nome	Descrição
InternalServerError	Erro interno do servidor
{
  "code": "InternalServerError",
  "message": "Ops. Houve uma falha. Tente novamente em alguns instantes.",
  "details": ["Internal server error"]
}
Nível de confiança na entrega
Para aprimorar a segurança da sua entrega, desenvolvemos um conjunto de regras que nos permitem qualificar o nível de confiança na entrega. Essa qualificação é baseada nos parâmetros informados durante a criação do pedido e na alteração ou confirmação do endereço realizadas pelo cliente após a criação do pedido.
Teremos os seguintes níveis de confiança na entrega
Nome	Descrição
LOW	Nível de confiança baixo
MODERATE	Nível de confiança moderado
HIGH	Nível de confiança alto
VERY_HIGH	Nível de confiança muito alto
E o cálculo do nível de confiança na entrega será feita baseado nas seguintes regras
Nome	Descrição
customer_phone_valid	Para ser válido o telefone informado deve conter o valor do atributo diferente de customer.phone.type="STORE", sem números repetidos ou em sequência e possuir mais do que 11 dígitos.
customer_phone_is_fixed	O telefone é um telefone fixo com 8 dígitos.
customer_address_confirmed	O endereço da entrega foi confirmado pelo cliente final.
customer_address_change_requested	O cliente final solicitou a alteração do endereço da entrega.
customer_address_change_approved	O parceiro aprovou a alteração do endereço da entrega.
customer_address_change_denied	O parceiro rejeitou a alteração do endereço da entrega.
Exemplos de como ficariam os níveis de confiança na entrega
Pedido com customer_phone_is_valid:false terá um score LOW.
Pedido com customer_phone_is_fixed:true terá um score MODERATE.
Pedido com customer_phone_is_fixed:true e customer_address_confirmed:true teria um score VERY_HIGH.
Pedido com customer_phone_is_valid:true terá um score HIGH.
Pedido com customer_phone_is_valid:true e customer_address_change_requested:true e merchant_address_change_approved:true terá um score VERY_HIGH .
Pedido com customer_phone_is_valid:true e customer_address_change_requested:true e merchant_address_change_denied:true terá um score LOW.
O nível de confiança na entrega pode ser alterado após a criação do pedido. Ações realizadas após a criação do pedido, como a confirmação do endereço ou a solicitação de alteração de endereço, têm um impacto direto no nível de confiança na entrega.
Consulta do nível de confiança na entrega
Para descobrir qual o nível de confiança na entrega do seu pedido, basta enviar a requisição GET /safeDelivery passando os seguintes parâmetros.
orderId - ID do do pedido a ser consultado o nível de segurança na entrega.
/shipping/v1.0/orders/:orderId/safeDelivery
Respostas
Sucesso
Este endpoint retorna o http status code 200 OK caso o pedido seja elegível a segurança na entrega. O corpo da resposta contém:
rules - contém um map do tipo [string]boolean contendo a regra e situação.
score - nível de confiança da entrega do pedido gerado com base nas regras definidas no campo rules.
{
  "rules": {
    "customer_address_change_requested": false,
    "customer_address_confirmed": false,
    "customer_phone_is_fixed": false,
    "customer_phone_valid": true,
    "merchant_address_change_approved": false,
    "merchant_address_change_denied": false
  },
  "score": "HIGH"
}
Erro
Este endpoint retorna o http status code 400 Bad Request caso os parâmetros esperados não sejam fornecidos.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
OrderWithoutSafeDelivery	Pedido não possui regras de confiança na entrega
BadRequest
{
  "code": "BadRequest",
  "message": "Houve um problema na leitura de informações. Verifique as informações enviadas.",
  "details": ["Campo 'OrderID' deve estar no formato uuid."]
}
OrderWithoutSafeDelivery
{
  "code": "OrderWithoutSafeDelivery",
  "message": "Pedido sem regras de confiança na entrega.",
  "details": []
}
Este endpoint retorna o http status code 404 Not Found caso o pedido não seja encontrado.
Nome	Descrição
OrderNotFound	Pedido não encontrado
{
  "code": "OrderNotFound",
  "message": "Pedido não encontrado.",
  "details": []
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao consultar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
{
  "code": "InternalServerError",
  "message": "Ops. Houve uma falha. Tente novamente em alguns instantes.",
  "details": ["Internal server error"]
}
Pedidos na plataforma do iFood
Fluxo de integração
Client
API
Polling de Eventos
1- Disponibilidade de Entrega
GET /orders/{orderId}/deliveryAvailabilities
Disponibilidade e janelas de entrega
2- Registro do pedido
POST /orders/{orderId}/requestDriver
Envia evento de request driver
ID do pedido
3- Cancelamento da entrega
POST /orders/{orderId}/cancelRequestDriver
Envia evento de cancel request driver
Retorna solicitação aceita
Client
API
Polling de Eventos
Disponibilidade de entrega
Antes de registrar uma solicitação de entrega é importante consultar a cotação/disponibilidade de entrega. É possível que o endereço não esteja dentro da área de cobertura e mesmo que o endereço esteja dentro da área, é possível que exista alguma indisponibilidade temporária na região, como raio de entrega reduzido temporariamente. Através dessa consulta é possível obter também a janela de tempo estimada para a entrega do pedido para informar o cliente.
Esse passo não é obrigatório, mas realizar a consulta antes de registrar o pedido evita que erros aconteçam e permitem que a loja se planeje na preparação do pedido.
Para consultar a cotação da logística para um pedido pré-existente dentro da plataforma iFood, basta realizar a requisição GET /deliveryAvailabilities passando os seguintes parâmetros:
orderId - ID do pedido já existente na plataforma ifood para solicitar a entrega
/shipping/v1.0/orders/<orderId>/deliveryAvailabilities
Respostas
Sucesso
Este endpoint retorna o http status code 200 OK caso a logística esteja disponível. O corpo da resposta contém:
id - id da cotação
expirationAt - data e hora expiração da contação UTC
createdAt - data e hora da criação da cotação UTC
quote.grossValue - valor bruto da entrega
quote.discount - valor do desconto da entrega
quote.raise - valor do acréscimo
quote.netValue - valor líquido da entrega
deliveryTime.min - tempo mínimo estimado para entrega em segundos
deliveryTime.max - tempo máximo estimado para entrega em segundos
distance - raio de distância de entrega em metros (1000, 2000, 3000...)
preparationTime - tempo de preparo em segundos
hasPaymentMethods - informa se há métodos de pagamento disponíveis
paymentMethods.id - id do método de pagamento
paymentMethods.brand - bandeira do cartão de crédito/débito
paymentMethods.liability - responsável por receber o pagamento (IFOOD)
paymentMethods.paymentType - tipo de pagamento ex.: OFFLINE
paymentMethods.method - método de pagamento CREDIT ou DEBIT
{
  "id": "57cd1046-2e06-446f-a2dd-18a518212c3c",
  "expirationAt": "2023-08-18T19:49:06Z",
  "createdAt": "2023-08-17T19:49:06Z",
  "distance": 3000,
  "preparationTime": 60,
  "quote": {
    "grossValue": 7.99,
    "discount": 0,
    "raise": 0,
    "netValue": 7.99
  },
  "deliveryTime": {
    "min": 1200,
    "max": 1800
  },
  "hasPaymentMethods": true,
  "paymentMethods": [
    {
      "id": "21c65a8c-f29e-463f-b0bd-240edeb593c4",
      "brand": "CardBrand",
      "liability": "IFOOD",
      "paymentType": "OFFLINE",
      "method": "CREDIT"
    }
  ]
}
Erro
Este endpoint retorna o http status code 400 Bad Request caso a logística não esteja disponível para entregar o pedido nessa localização ou para esse merchant.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
BadRequestMerchant	Parceiro indisponível
DeliveryDistanceTooHigh	O endereço de entrega ultrapassa a área logística atendida pelo iFood
OffOpeningHours	O pedido está fora do horário de funcionamento da logística iFood
OriginNotFound	Ainda não entregamos na sua região, pois sua loja está fora da área logística do iFood
ServiceAreaMismatch	O endereço da entrega está fora da nossa área de cobertura
HighDemand	A logística iFood está temporariamente indisponível. Por favor, tente novamente mais tarde
MerchantStatusAvailability	Restaurante com pendência, acione o Suporte
InvalidPaymentMethods	A forma de pagamento escolhida pelo cliente não é aceita pela maquininha do iFood
SaturatedOfflinePayment	No momento, a opção de pagamento na entrega está indisponível
NRELimitExceeded	Sua loja está com muitos entregadores parceiros aguardando. Libere entregadores para que consiga solicitar a entrega Sob Demanda.
{
  "code": "DeliveryDistanceTooHigh",
  "message": "Sob Demanda indisponivel: o endereço da entrega esta a mais de 10 Km da sua loja.",
  "details": ["Delivery distance too high"]
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
{
  "code": "InternalServerError",
  "message": "Ops. Houve uma falha. Tente novamente em alguns instantes.",
  "details": ["Internal server error"]
}
Solicitação de entrega
Para solicitar o entregador concordando com a cotação retornada, utilize o seguinte endpoint POST /requestDriver passando no corpo as informações do pedido.
Esse endpoint é assíncrono. Quando sua requisição for processada você receberá um evento REQUEST_DRIVER confirmando que a requisição foi feita e em seguida o resultado da solicitação, que pode ser: REQUEST_DRIVER_SUCCESS ou REQUEST_DRIVER_FAILED.
Atenção! Um entregador parceiro será alocado automaticamente após a solicitação através deste endpoint. Caso não seja possível realizar a entrega, a solicitação de entrega não é registrada e é retornado um erro.
orderId - ID do pedido já existente na plataforma ifood para solicitar a entrega
quoteId - ID da cotação solicitada anteriormente para solicitar a entrega
/shipping/v1.0/orders/<orderId>/requestDriver
Respostas
Sucesso
Este endpoint retorna o http status code 202 Accepted caso o solicitação seja registrada com sucesso.
Erros
Este endpoint retorna o http status code 400 Bad Request caso a logística não esteja disponível para entregar o pedido ou ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
BadRequestCustomer	Cliente indisponível
BadRequestMerchant	Parceiro indisponível
DeliveryDistanceTooHigh	O endereço de entrega ultrapassa a área logística atendida pelo iFood
HighDemand	A logística iFood está temporariamente indisponível. Por favor, tente novamente mais tarde
MerchantEasyDeliveryDisabled	Serviço não habilitado
OffOpeningHours	O pedido está fora do horário de funcionamento da logística iFood
OriginNotFound	Ainda não entregamos na sua região, pois sua loja está fora da área logística do iFood
ServiceAreaMismatch	O endereço da entrega está fora da nossa área de cobertura
MerchantStatusAvailability	Restaurante com pendência, acione o Suporte
InvalidPaymentMethods	A forma de pagamento escolhida pelo cliente não é aceita pela maquininha do iFood
SaturatedOfflinePayment	No momento, a opção de pagamento na entrega está indisponível
NRELimitExceeded	Sua loja está com muitos entregadores parceiros aguardando. Libere entregadores para que consiga solicitar a entrega Sob Demanda.
{
  "code": "DeliveryDistanceTooHigh",
  "message": "Sob Demanda indisponivel: o endereço da entrega esta a mais de 10 Km da sua loja.",
  "details": ["Delivery distance too high"]
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao registrar esse pedido.
Nome	Descrição
InternalServerError	Erro interno do servidor
{
  "code": "InternalServerError",
  "message": "Ops. Houve uma falha. Tente novamente em alguns instantes.",
  "details": ["Internal server error"]
}
Cancelamento
Para cancelar a solicitação de um entregador iFood sem a necessidade de cancelar o pedido, o cancelamento da entrega deve ser realizado através do endpoint POST /orders/{id}/cancelRequestDriver.
O cancelamento só será efetuado se ele for solicitado antes do aceite do entregador, neste caso nenhuma taxa será cobrada da loja. Caso seja necessário realizar o cancelamento após do aceite do entregador, deve seguir as regras estabelecidas em Cancelamento de pedido.
O endpoint é assíncrono. Quando sua requisição for processada a loja receberá um evento DELIVERY_CANCELLATION_REQUEST_ACCEPTED, em caso de sucesso, ou DELIVERY_CANCELLATION_REQUEST_REJECTED, em caso de falha. Veja todos os detalhes desses eventos nessa seção.
Importante
A ação é irreversível. Após cancelar a solicitação de um entregador, não será possível reverter esse serviço.
Para que um novo entregador seja solicitado, uma nova solicitação de entregador deve ser realizada.
/shipping/v1.0/orders/<orderId>/cancelRequestDriver
Respostas
Sucesso
Esse endpoint retorna HTTP Status 202, sem nada no corpo da resposta
O polling receberá um evento de DELIVERY_CANCELLATION_REQUESTED quando a solicitação for enviada com sucesso.
Erro
Este endpoint retorna o http status code 400 Bad Request caso os parâmetros esperados não sejam fornecidos.
Nome	Descrição
BadRequest	Houve um problema ao solicitar a entrega. Verifique as informações enviadas
{
  "code": "BadRequest",
  "message": "Houve um problema ao solicitar a entrega. Verifique as informações enviadas.",
  "details": ["Campo 'OrderID' deve estar no formato uuid."]
}
Este endpoint retorna o http status code 500 Internal Server Error caso ocorra alguma falha ao solicitar o cancelamento da entrega.
Nome	Descrição
InternalServerError	Erro interno do servidor
{
  "code": "InternalServerError",
  "message": "Ops. Houve uma falha. Tente novamente em alguns instantes.",
  "details": ["Internal server error"]
}