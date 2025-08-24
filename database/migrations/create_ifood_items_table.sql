-- Create table for iFood items (menu items)
CREATE TABLE IF NOT EXISTS ifood_items (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(255) UNIQUE NOT NULL,
    merchant_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255),
    category_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    original_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    image_path TEXT,
    external_code VARCHAR(255),
    serving VARCHAR(50),
    dietary_restrictions TEXT[],
    tags TEXT[],
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ifood_items_merchant_id ON ifood_items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_ifood_items_category_id ON ifood_items(category_id);
CREATE INDEX IF NOT EXISTS idx_ifood_items_user_id ON ifood_items(user_id);
CREATE INDEX IF NOT EXISTS idx_ifood_items_status ON ifood_items(status);

-- Create table for iFood item options (customizations)
CREATE TABLE IF NOT EXISTS ifood_item_options (
    id SERIAL PRIMARY KEY,
    option_id VARCHAR(255) UNIQUE NOT NULL,
    item_id VARCHAR(255) REFERENCES ifood_items(item_id) ON DELETE CASCADE,
    option_group_id VARCHAR(255),
    product_id VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    price DECIMAL(10, 2),
    original_price DECIMAL(10, 2),
    min_quantity INT DEFAULT 0,
    max_quantity INT DEFAULT 1,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for ifood_item_options
CREATE INDEX IF NOT EXISTS idx_ifood_item_options_item_id ON ifood_item_options(item_id);
CREATE INDEX IF NOT EXISTS idx_ifood_item_options_group_id ON ifood_item_options(option_group_id);

-- Create table for iFood option groups
CREATE TABLE IF NOT EXISTS ifood_option_groups (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(255) UNIQUE NOT NULL,
    item_id VARCHAR(255) REFERENCES ifood_items(item_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    type VARCHAR(50), -- SIZE, FLAVOR, etc.
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for ifood_option_groups
CREATE INDEX IF NOT EXISTS idx_ifood_option_groups_item_id ON ifood_option_groups(item_id);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ifood_items_updated_at BEFORE UPDATE
    ON ifood_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ifood_item_options_updated_at BEFORE UPDATE
    ON ifood_item_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ifood_option_groups_updated_at BEFORE UPDATE
    ON ifood_option_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();