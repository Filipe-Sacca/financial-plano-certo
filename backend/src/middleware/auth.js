const { createClient } = require('@supabase/supabase-js');

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware de autenticação básica
const authenticateUser = async (req, res, next) => {
  try {
    // Verificar se existe header de autenticação
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Para desenvolvimento, permitir acesso sem autenticação
      // Em produção, isso deve ser removido
      if (process.env.NODE_ENV === 'development') {
        req.user = { id: 'dev-user', role: 'admin' };
        return next();
      }

      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido'
      });
    }

    // Verificar formato Bearer token
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido'
      });
    }

    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Em desenvolvimento, criar usuário mock
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          id: 'dev-user',
          email: 'dev@example.com',
          role: 'admin'
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);

    // Em desenvolvimento, permitir continuar
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: 'dev-user', role: 'admin' };
      return next();
    }

    res.status(500).json({
      success: false,
      error: 'Erro no processo de autenticação'
    });
  }
};

// Middleware para verificar permissões específicas
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Permissão insuficiente'
      });
    }

    next();
  };
};

// Middleware para validar merchant_id do usuário
const validateMerchantOwnership = async (req, res, next) => {
  try {
    const merchantId = req.params.merchantId || req.query.merchant_id || req.body.merchant_id;
    const userId = req.user?.id;

    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'merchant_id é obrigatório'
      });
    }

    // Em desenvolvimento, permitir qualquer merchant
    if (process.env.NODE_ENV === 'development') {
      req.merchantId = merchantId;
      return next();
    }

    // Verificar se o usuário tem acesso ao merchant
    const { data, error } = await supabase
      .from('user_merchants')
      .select('merchant_id')
      .eq('user_id', userId)
      .eq('merchant_id', merchantId)
      .single();

    if (error || !data) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado a este merchant'
      });
    }

    req.merchantId = merchantId;
    next();
  } catch (error) {
    console.error('Erro ao validar merchant:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao validar permissões do merchant'
    });
  }
};

module.exports = {
  authenticateUser,
  requireRole,
  validateMerchantOwnership
};