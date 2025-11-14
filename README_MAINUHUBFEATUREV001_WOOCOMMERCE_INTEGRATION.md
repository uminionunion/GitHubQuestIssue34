# MainUhubFeatureV001 - WooCommerce Integration Guide

Complete guide for connecting your MainUhubFeatureV001 store products to a Hostinger WooCommerce store using child themes, SKUs, and database synchronization.

---

## Table of Contents
1. [WooCommerce Store Setup](#woocommerce-store-setup)
2. [Child Theme Creation](#child-theme-creation)
3. [Database Integration](#database-integration)
4. [Product Synchronization Methods](#product-synchronization-methods)
5. [Cart & Checkout Integration](#cart--checkout-integration)
6. [Troubleshooting](#troubleshooting)

---

## WooCommerce Store Setup

### Prerequisites
- Hostinger hosting account with WordPress installed
- WooCommerce plugin installed and activated
- Access to Hostinger File Manager or FTP

### Initial WooCommerce Configuration

1. **Install WooCommerce Plugin**
   ```
   WordPress Admin > Plugins > Add New > Search "WooCommerce" > Install & Activate
   ```

2. **Enable WooCommerce REST API**
   ```
   WordPress Admin > WooCommerce > Settings > REST API
   - Generate a new key for your MainUhubFeatureV001 application
   - Copy the Consumer Key and Consumer Secret for API integration
   - Set permissions to "Read/Write"
   ```

3. **Configure Store Settings**
   ```
   WordPress Admin > WooCommerce > Settings > General
   - Set store name: "Uminion Union Store"
   - Set store address and contact details
   - Choose currency (USD recommended)
   - Enable product catalog mode if needed
   ```

---

## Child Theme Creation

### Why Use a Child Theme?
A child theme allows you to customize WooCommerce without losing changes during parent theme updates. It's the safe way to integrate custom functionality.

### Step 1: Create Child Theme Directory

Via Hostinger File Manager:
1. Navigate to `/public_html/wp-content/themes/`
2. Create new folder: `your-parent-theme-child`
3. Example: If parent theme is "storefront", create "storefront-child"

### Step 2: Create style.css File

Create file: `/public_html/wp-content/themes/your-parent-theme-child/style.css`

```css
/*
 * Theme Name: Your Parent Theme Child
 * Theme URI: https://yourstore.com
 * Description: Child theme for MainUhubFeatureV001 integration
 * Author: Your Name
 * Author URI: https://yourstore.com
 * Template: your-parent-theme
 * Version: 1.0.0
 * Text Domain: your-parent-theme-child
 */

@import url("../your-parent-theme/style.css");

/* Custom styles for MainUhubFeatureV001 integration */
.mainuhubfeaturev001-product-item {
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 20px;
}

.mainuhubfeaturev001-product-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}

.mainuhubfeaturev001-add-to-cart-btn {
    background-color: #ff9800;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.mainuhubfeaturev001-add-to-cart-btn:hover {
    background-color: #e68900;
}
```

### Step 3: Create functions.php File

Create file: `/public_html/wp-content/themes/your-parent-theme-child/functions.php`

```php
<?php
/**
 * MainUhubFeatureV001 Child Theme Functions
 * This file handles integration between MainUhubFeatureV001 and WooCommerce
 */

// Enqueue child theme stylesheet
add_action('wp_enqueue_scripts', function() {
    // Load parent theme stylesheet
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
    
    // Load child theme stylesheet
    wp_enqueue_style('child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style'));
});

/**
 * REST API Endpoint for retrieving MainUhubFeatureV001 products
 * Endpoint: /wp-json/mainuhubfeaturev001/v1/products
 */
add_action('rest_api_init', function() {
    register_rest_route('mainuhubfeaturev001/v1', '/products', array(
        'methods' => 'GET',
        'callback' => 'mainuhubfeaturev001_get_products',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('mainuhubfeaturev001/v1', '/products/sku/(?P<sku>\w+)', array(
        'methods' => 'GET',
        'callback' => 'mainuhubfeaturev001_get_product_by_sku',
        'permission_callback' => '__return_true'
    ));
    
    register_rest_route('mainuhubfeaturev001/v1', '/add-to-cart', array(
        'methods' => 'POST',
        'callback' => 'mainuhubfeaturev001_add_to_cart',
        'permission_callback' => '__return_true'
    ));
});

/**
 * Retrieve all products from WooCommerce
 * Filters by MainUhubFeatureV001 categories
 */
function mainuhubfeaturev001_get_products() {
    // Get all WooCommerce products
    $args = array(
        'post_type' => 'product',
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'DESC'
    );
    
    $products = new WP_Query($args);
    $product_data = array();
    
    if ($products->have_posts()) {
        while ($products->have_posts()) {
            $products->the_post();
            $product = wc_get_product(get_the_ID());
            
            $product_data[] = array(
                'id' => $product->get_id(),
                'name' => $product->get_name(),
                'sku' => $product->get_sku(),
                'price' => $product->get_price(),
                'description' => $product->get_description(),
                'image' => get_the_post_thumbnail_url(null, 'full'),
                'permalink' => get_the_permalink(),
                'stock' => $product->get_stock_quantity()
            );
        }
    }
    
    wp_reset_postdata();
    
    return new WP_REST_Response($product_data, 200);
}

/**
 * Retrieve a single product by SKU
 * Used for MainUhubFeatureV001 product lookups
 */
function mainuhubfeaturev001_get_product_by_sku($request) {
    $sku = $request->get_param('sku');
    
    // Find product by SKU in WooCommerce
    $product_id = wc_get_product_id_by_sku($sku);
    
    if (!$product_id) {
        return new WP_REST_Response(array('error' => 'Product not found'), 404);
    }
    
    $product = wc_get_product($product_id);
    
    $product_data = array(
        'id' => $product->get_id(),
        'name' => $product->get_name(),
        'sku' => $product->get_sku(),
        'price' => $product->get_price(),
        'description' => $product->get_description(),
        'image' => get_the_post_thumbnail_url($product_id, 'full'),
        'permalink' => $product->get_permalink(),
        'stock' => $product->get_stock_quantity()
    );
    
    return new WP_REST_Response($product_data, 200);
}

/**
 * Add item to WooCommerce cart via API
 * Called from MainUhubFeatureV001 "Add to Cart" button
 */
function mainuhubfeaturev001_add_to_cart($request) {
    $params = $request->get_json_params();
    $product_id = $params['product_id'] ?? null;
    $quantity = $params['quantity'] ?? 1;
    
    if (!$product_id) {
        return new WP_REST_Response(array('error' => 'Product ID required'), 400);
    }
    
    // Add product to cart
    WC()->cart->add_to_cart($product_id, $quantity);
    
    return new WP_REST_Response(array(
        'message' => 'Product added to cart',
        'cart_url' => wc_get_cart_url()
    ), 200);
}

/**
 * Register MainUhubFeatureV001 custom product fields
 * Allows linking MainUhubFeatureV001 products with WooCommerce products
 */
add_action('acf/init', function() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group(array(
            'key' => 'group_mainuhubfeaturev001_product',
            'title' => 'MainUhubFeatureV001 Product Fields',
            'fields' => array(
                array(
                    'key' => 'field_mainuhubfeaturev001_store_id',
                    'label' => 'Store ID',
                    'name' => 'mainuhubfeaturev001_store_id',
                    'type' => 'text',
                    'instructions' => 'Link to MainUhubFeatureV001 store (e.g., UnionSAM#20)'
                ),
                array(
                    'key' => 'field_mainuhubfeaturev001_product_id',
                    'label' => 'Product ID',
                    'name' => 'mainuhubfeaturev001_product_id',
                    'type' => 'number',
                    'instructions' => 'Link to MainUhubFeatureV001 product'
                )
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'product'
                    )
                )
            )
        ));
    }
});

/**
 * Custom filter for MainUhubFeatureV001 products
 * Displays only products linked to MainUhubFeatureV001
 */
function mainuhubfeaturev001_product_filter_shortcode() {
    $store_id = isset($_GET['store_id']) ? sanitize_text_field($_GET['store_id']) : '';
    
    $args = array(
        'post_type' => 'product',
        'posts_per_page' => 12,
        'paged' => max(1, get_query_var('paged'))
    );
    
    if ($store_id) {
        $args['meta_query'] = array(
            array(
                'key' => 'mainuhubfeaturev001_store_id',
                'value' => $store_id,
                'compare' => '='
            )
        );
    }
    
    $products = new WP_Query($args);
    $output = '<div class="mainuhubfeaturev001-products">';
    
    if ($products->have_posts()) {
        while ($products->have_posts()) {
            $products->the_post();
            $product = wc_get_product(get_the_ID());
            
            $output .= '<div class="mainuhubfeaturev001-product-item">';
            $output .= '<img src="' . get_the_post_thumbnail_url(null, 'large') . '" alt="' . get_the_title() . '" class="mainuhubfeaturev001-product-image">';
            $output .= '<h3>' . get_the_title() . '</h3>';
            $output .= '<p class="price">' . $product->get_price_html() . '</p>';
            $output .= '<a href="' . get_the_permalink() . '" class="mainuhubfeaturev001-add-to-cart-btn">View Product</a>';
            $output .= '</div>';
        }
    }
    
    $output .= '</div>';
    wp_reset_postdata();
    
    return $output;
}

add_shortcode('mainuhubfeaturev001_products', 'mainuhubfeaturev001_product_filter_shortcode');
?>
```

---

## Database Integration

### SQLite to MySQL Synchronization

Your MainUhubFeatureV001 application uses SQLite. To sync with WooCommerce (MySQL), you'll need bidirectional sync.

#### Step 1: Create Sync Endpoint (Backend)

Add to `/server/woocommerce.ts`:

```typescript
import { Router } from 'express';
import { db } from './db.js';
import fetch from 'node-fetch';

const router = Router();

// WooCommerce API credentials
const WC_API_URL = process.env.WC_API_URL || 'https://yourstore.com/wp-json/wc/v3';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || '';

// Base64 encode credentials for Basic Auth
const wcAuth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

/**
 * Sync MainUhubFeatureV001 products to WooCommerce
 * POST /api/woocommerce/sync-products
 */
router.post('/sync-products', async (req, res) => {
  try {
    // Get all products from MainUhubFeatureV001 SQLite database
    const products = await db
      .selectFrom('products')
      .selectAll()
      .execute();

    // Send each product to WooCommerce
    for (const product of products) {
      const wcProduct = {
        name: product.name,
        description: product.description || '',
        short_description: product.subtitle || '',
        price: product.price?.toString(),
        sku: product.sku || `UMINION-${product.id}`,
        stock_quantity: product.stock_quantity || 0,
        manage_stock: true,
        images: product.image_url ? [{ src: product.image_url }] : []
      };

      // Create or update product in WooCommerce
      const wcResponse = await fetch(`${WC_API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${wcAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(wcProduct)
      });

      if (!wcResponse.ok) {
        console.error(`Failed to sync product ${product.id}:`, await wcResponse.text());
      }
    }

    res.json({ message: 'Products synced successfully' });
  } catch (error) {
    console.error('Product sync error:', error);
    res.status(500).json({ message: 'Sync failed' });
  }
});

/**
 * Fetch products from WooCommerce and cache in MainUhubFeatureV001
 * GET /api/woocommerce/fetch-products
 */
router.get('/fetch-products', async (req, res) => {
  try {
    const wcResponse = await fetch(`${WC_API_URL}/products?per_page=100`, {
      headers: {
        'Authorization': `Basic ${wcAuth}`
      }
    });

    if (!wcResponse.ok) {
      throw new Error('WooCommerce API error');
    }

    const products = await wcResponse.json();

    // Store in MainUhubFeatureV001 database for faster access
    for (const product of products) {
      await db
        .insertInto('wc_products')
        .values({
          wc_id: product.id,
          name: product.name,
          sku: product.sku,
          price: parseFloat(product.price),
          description: product.description,
          image_url: product.images[0]?.src || null,
          wc_sync_date: new Date().toISOString()
        })
        .onConflict((oc) => 
          oc.column('wc_id').doUpdateSet({
            name: product.name,
            price: parseFloat(product.price),
            image_url: product.images[0]?.src || null,
            wc_sync_date: new Date().toISOString()
          })
        )
        .execute();
    }

    res.json({ message: 'Products fetched and cached', count: products.length });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Fetch failed' });
  }
});

export default router;
```

Update `/server/index.ts` to include the WooCommerce router:

```typescript
import wcRouter from './woocommerce.js';
app.use('/api/woocommerce', wcRouter);
```

#### Step 2: Add WC Products Table to Database

Create migration file or run manually:

```sql
CREATE TABLE IF NOT EXISTS wc_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wc_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  price REAL,
  description TEXT,
  image_url TEXT,
  wc_sync_date TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wc_sku ON wc_products(sku);
```

---

## Product Synchronization Methods

### Method 1: Using SKUs (Recommended)

SKUs (Stock Keeping Units) provide a unique identifier for products across systems.

#### Setup in WooCommerce:
1. Edit each product
2. Scroll to "Product data" section
3. Enter SKU in format: `UMINION-{STORE}-{PRODUCT_ID}`
   - Example: `UMINION-SAM20-001`

#### Sync from Frontend

Add to `client/src/features/profile/MainUhubFeatureV001ForAddProductModal.tsx`:

```typescript
// Add SKU field to product creation
const [sku, setSku] = useState('');

// Generate SKU automatically
const generateSKU = (storeName: string, productName: string) => {
  const storeCode = storeName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
  const productCode = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `UMINION-${storeCode}-${productCode}-${timestamp}`;
};

// Sync to WooCommerce
const syncToWooCommerce = async () => {
  const sku = generateSKU('UnionSAM', title);
  
  const response = await fetch('/api/woocommerce/sync-products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: title,
      description: description,
      price: price,
      image_url: image_url,
      sku: sku
    })
  });
  
  if (response.ok) {
    alert('Product synced to WooCommerce!');
  }
};
```

### Method 2: Direct API Integration

Use WooCommerce REST API for real-time sync.

#### Setup `.env` file:

```env
WC_API_URL=https://yourstore.com/wp-json/wc/v3
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
```

#### Create WooCommerce Service

Add to `client/src/services/WooCommerceService.ts`:

```typescript
export class WooCommerceService {
  private apiUrl = '/api/woocommerce';

  /**
   * Fetch all products from WooCommerce
   */
  async fetchProducts() {
    const response = await fetch(`${this.apiUrl}/fetch-products`);
    return response.json();
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string) {
    const response = await fetch(`${this.apiUrl}/product-by-sku/${sku}`);
    return response.json();
  }

  /**
   * Sync MainUhubFeatureV001 product to WooCommerce
   */
  async syncProduct(product: any) {
    const response = await fetch(`${this.apiUrl}/sync-products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return response.json();
  }

  /**
   * Add product to WooCommerce cart
   */
  async addToCart(productId: number, quantity: number = 1) {
    const response = await fetch(`${this.apiUrl}/add-to-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    return response.json();
  }
}

export const wcService = new WooCommerceService();
```

---

## Cart & Checkout Integration

### Option 1: Embedded Cart

Add WooCommerce cart to MainUhubFeatureV001:

```typescript
import { WooCommerceService } from '../services/WooCommerceService';

const [cartItems, setCartItems] = useState([]);

// Fetch cart items
const loadCart = async () => {
  const items = await WooCommerceService.getCart();
  setCartItems(items);
};

// Handle add to cart
const handleAddToCart = async (productId: number) => {
  const result = await WooCommerceService.addToCart(productId, 1);
  if (result.success) {
    loadCart();
  }
};
```

### Option 2: Redirect to WooCommerce

Redirect users to WooCommerce checkout for premium features:

```typescript
const handleCheckout = () => {
  window.location.href = 'https://yourstore.com/cart/';
};

const handleAddToWooCart = async (productId: number) => {
  const result = await fetch(`/api/woocommerce/add-to-cart`, {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity: 1 })
  });
  const data = await result.json();
  window.location.href = data.cart_url;
};
```

---

## WordPress Plugin Recommendations

### Recommended Plugins for Integration:

1. **WooCommerce REST API** (Built-in)
   - Provides API endpoints for product management
   - Status: Already enabled with WooCommerce

2. **Advanced Custom Fields (ACF)**
   - Adds custom fields to link MainUhubFeatureV001 products
   - Download: wordpress.org/plugins/advanced-custom-fields/

3. **WooCommerce API Manager**
   - Manages API keys and permissions
   - Download: wordpress.org/plugins/woocommerce/

4. **Product Import & Export for WooCommerce**
   - Bulk sync products from CSV
   - Download: wordpress.org/plugins/woo-product-feed-pro/

---

## Environment Variables

Add to your `.env` file:

```env
# WooCommerce Integration
WC_API_URL=https://yourstore.com/wp-json/wc/v3
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxx

# Store Configuration
STORE_NAME=Uminion Union
STORE_CURRENCY=USD
```

---

## Troubleshooting

### Issue: Products Not Syncing

**Solution:**
1. Verify WooCommerce API credentials are correct
2. Check REST API is enabled: WooCommerce > Settings > REST API
3. Ensure API user has "Read/Write" permissions
4. Check server logs for CORS errors

### Issue: SKU Not Mapping Correctly

**Solution:**
1. Ensure SKU format is consistent: `UMINION-{CODE}`
2. Check for duplicate SKUs in WooCommerce
3. Verify SKU field is not empty
4. Use `GET /api/woocommerce/product-by-sku/{sku}` to test

### Issue: Cart Not Updating

**Solution:**
1. Verify WooCommerce cart session is active
2. Check browser console for JavaScript errors
3. Clear browser cache and cookies
4. Test with incognito/private mode

### Issue: Images Not Loading

**Solution:**
1. Ensure image URLs are publicly accessible
2. Check image permissions in Hostinger File Manager
3. Verify CDN settings if using one
4. Use absolute URLs instead of relative paths

---

## Docker Integration

To containerize WooCommerce integration:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: woocommerce
      MYSQL_USER: wc_user
      MYSQL_PASSWORD: wc_password
    volumes:
      - mysql_data:/var/lib/mysql

  wordpress:
    image: wordpress:latest
    depends_on:
      - mysql
    environment:
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_USER: wc_user
      WORDPRESS_DB_PASSWORD: wc_password
      WORDPRESS_DB_NAME: woocommerce
    volumes:
      - ./wp-content:/var/www/html/wp-content
    ports:
      - "8080:80"

  app:
    build: .
    depends_on:
      - mysql
    environment:
      WC_API_URL: http://wordpress/wp-json/wc/v3
      WC_CONSUMER_KEY: ${WC_CONSUMER_KEY}
      WC_CONSUMER_SECRET: ${WC_CONSUMER_SECRET}
    ports:
      - "4000:4000"

volumes:
  mysql_data:
```

---

## Support & Additional Resources

- WooCommerce REST API Docs: https://woocommerce.com/document/woocommerce-rest-api/
- Hostinger WordPress Docs: https://support.hostinger.com/en/articles/360000192500
- Custom Child Theme Guide: https://developer.wordpress.org/themes/advanced-topics/child-themes/
- SKU Best Practices: https://woocommerce.com/document/product-short-description/

---

**Last Updated:** 2025
**Version:** 1.0.0
**Maintained by:** MainUhubFeatureV001 Development Team
