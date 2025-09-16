-- Migration: Create product_images table
-- Purpose: Store iFood image paths for products to enable proper two-step workflow

CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL, -- iFood product ID
  merchant_id TEXT NOT NULL, -- iFood merchant ID
  image_path TEXT NOT NULL, -- Path returned by iFood after upload
  upload_status TEXT DEFAULT 'uploaded', -- uploaded, applied, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Indexes for fast lookups
  UNIQUE(product_id, merchant_id)
);

-- Index for fast product lookups
CREATE INDEX idx_product_images_product_merchant ON public.product_images(product_id, merchant_id);

-- Index for status filtering
CREATE INDEX idx_product_images_status ON public.product_images(upload_status);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_product_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_images_updated_at
  BEFORE UPDATE ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION update_product_images_updated_at();

-- RLS Policies (if needed)
-- ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;