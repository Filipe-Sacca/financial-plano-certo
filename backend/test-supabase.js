// Teste de conectividade Supabase
const https = require('https');

// Testar API do Supabase
const supabaseUrl = 'https://icovzxzchijidohccopf.supabase.co';
const anonKey = 'sb_secret_GWGugnlat9eW-qKzuN5p6Q_UkTWwAeL';

console.log('🔗 Testando conectividade com Supabase...');
console.log(`📍 Project ID: icovzxzchijidohccopf`);
console.log(`🌐 URL: ${supabaseUrl}`);

// Teste simples da API REST
const options = {
  hostname: 'icovzxzchijidohccopf.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
};

const req = https.request(options, (res) => {
  console.log(`\n✅ Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n🎉 Conexão com Supabase estabelecida com sucesso!');
    if (res.statusCode === 200 || res.statusCode === 401) {
      console.log('✅ API REST está respondendo');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Erro na conexão: ${e.message}`);
});

req.end();