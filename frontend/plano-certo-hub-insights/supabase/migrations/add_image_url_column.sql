-- Migration: Add image_url column to product_images table
-- Purpose: Store the actual iFood image URL returned by catalog API

ALTER TABLE public.product_images
ADD COLUMN image_url TEXT;

-- Add index for faster image_url queries
CREATE INDEX idx_product_images_image_url ON public.product_images(image_url);

-- Add comment to explain the new column
COMMENT ON COLUMN public.product_images.image_url IS 'Full iFood image URL retrieved from catalog API';