// Simple Promotion Module - Copy this to server.ts after fixing TS errors

// GET /promotions/health - Health check
app.get('/promotions/health', async (req, res) => {
  console.log('🎁 [PROMOTION] Health check requested');
  res.json({
    success: true,
    data: {
      status: 'HEALTHY',
      service: 'ifood-promotion-service',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// POST /promotions/:merchantId - Create promotion
app.post('/promotions/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { userId, ...promotionData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    console.log(`🎁 [API] Creating promotion for merchant: ${merchantId}`);

    // Get token
    const tokenData = await getTokenForUser(userId);
    if (!tokenData?.access_token) {
      return res.status(401).json({
        success: false,
        error: 'No valid access token found'
      });
    }

    // For now, return mock success until iFood API is working
    const mockResponse = {
      aggregationId: `agg_${Date.now()}`,
      message: 'We have successfully received your request to create promotions'
    };

    // Save to database
    const { error: dbError } = await supabase
      .from('ifood_promotions')
      .insert({
        aggregation_id: mockResponse.aggregationId,
        aggregation_tag: promotionData.aggregationTag,
        merchant_id: merchantId,
        user_id: userId,
        promotion_name: promotionData.promotions[0]?.promotionName || 'Promoção sem nome',
        status: 'PENDING',
        promotion_data: promotionData,
        response_data: mockResponse
      });

    if (dbError) {
      console.error('❌ [PROMOTION] Database error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Database error'
      });
    }

    console.log('✅ [PROMOTION] Promotion saved to database');
    
    res.status(202).json({
      success: true,
      data: mockResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [PROMOTION] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /promotions/:merchantId - List promotions
app.get('/promotions/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { userId } = req.query;

    console.log(`🎁 [API] Listing promotions for merchant: ${merchantId}`);

    const { data: promotions, error } = await supabase
      .from('ifood_promotions')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Database error'
      });
    }

    res.json({
      success: true,
      data: {
        promotions: promotions || [],
        total: promotions?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});