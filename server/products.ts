import { Router } from 'express';
import { db } from './db.js';
import { authenticate } from './auth-middleware.js';
import path from 'path';
import { promises as fs } from 'fs';

const router = Router();

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), 'data', 'uploads');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('[PRODUCTS] Error creating upload directory:', error);
  }
};

// POST - Create a new product
router.post('/', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  console.log('[PRODUCTS] POST /api/products called');
  console.log('[PRODUCTS] req.body:', req.body);
  console.log('[PRODUCTS] req.files:', (req as any).files);

  // Handle both form data and JSON
  let name = req.body.name;
  let subtitle = req.body.subtitle;
  let description = req.body.description;
  let price = req.body.price;
  let payment_method = req.body.payment_method;
  let payment_url = req.body.payment_url;
  let store_id = req.body.store_id;
  let sku_id = req.body.sku_id;

  // Validate required fields
  if (!name || price === undefined || price === '') {
    res.status(400).json({ message: 'Name and price are required' });
    return;
  }

  try {
    // Check if user is blocked
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_blocked) {
      res.status(403).json({ message: 'Your account is blocked' });
      return;
    }

    // Handle file upload
    let imageUrl: string | null = null;
    if ((req as any).files && (req as any).files.image) {
      await ensureUploadDir();
      const uploadedFile = (req as any).files.image;
      const uploadDir = path.join(process.cwd(), 'data', 'uploads');
      const filename = `${Date.now()}-${uploadedFile.name}`;
      const filepath = path.join(uploadDir, filename);

      await uploadedFile.mv(filepath);
      imageUrl = `/api/uploads/${filename}`;
      console.log('[PRODUCTS] Image uploaded:', imageUrl);
    }

    // Determine store type based on user role
    let storeType: 'main' | 'user' | 'store' = 'user';
    let finalStoreId: number | null = null;

    if (user.is_high_high_high_admin === 1) {
      // HIGH-HIGH-HIGH admin: can add to main store
      storeType = 'main';
      finalStoreId = 0;
      console.log(`[PRODUCTS] HIGH-HIGH-HIGH admin ${user.username} adding to main store (store_id=0)`);
    } else if (user.is_high_high_admin === 1) {
      // HIGH-HIGH admin: can add to specific stores #01-#30
      if (!store_id) {
        res.status(400).json({ message: 'HIGH-HIGH admin must specify store_id (1-30)' });
        return;
      }
      const parsedStoreId = parseInt(store_id);
      if (isNaN(parsedStoreId) || parsedStoreId < 1 || parsedStoreId > 30) {
        res.status(400).json({ message: 'store_id must be between 1 and 30' });
        return;
      }
      storeType = 'store';
      finalStoreId = parsedStoreId;
      console.log(`[PRODUCTS] HIGH-HIGH admin ${user.username} adding to store #${finalStoreId}`);
    } else {
      // Regular user: personal store
      storeType = 'user';
      finalStoreId = null;
      console.log(`[PRODUCTS] User ${user.username} adding to personal store`);
    }

    // Create the product
    const product = await db
      .insertInto('MainHubUpgradeV001ForProducts')
      .values({
        name,
        subtitle: subtitle || null,
        description: description || null,
        price: price ? parseFloat(price) : null,
        image_url: imageUrl,
        store_type: storeType,
        user_id: storeType === 'user' ? req.user.userId : null,
        store_id: finalStoreId,
        payment_method: payment_method || null,
        payment_url: payment_url || null,
        sku_id: sku_id || null,
        is_in_trash: 0,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    console.log(`[PRODUCTS] Product created: ID=${product.id}, type=${storeType}, store_id=${finalStoreId}, sku=${sku_id || 'none'}`);

    res.status(201).json({
      message: 'Product created successfully',
      productId: product.id,
    });
  } catch (error) {
    console.error('[PRODUCTS] Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// GET - Get products by store
router.get('/store/:storeId', async (req, res) => {
  const { storeId } = req.params;

  try {
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('store_id', '=', parseInt(storeId))
      .where('is_in_trash', '=', 0)
      .orderBy('created_at', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching store products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET - Get user's products
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('user_id', '=', parseInt(userId))
      .where('is_in_trash', '=', 0)
      .orderBy('created_at', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching user products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET - Get all products for "Everything" (all sources, no duplicates)
router.get('/everything/all', async (req, res) => {
  try {
    // Fetch ALL products from ALL users, ALL stores, and main store
    // This includes: store_type='main', store_type='user' (ANY user), store_type='store'
    const allProducts = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .leftJoin(
        'users',
        'MainHubUpgradeV001ForProducts.user_id',
        'users.id'
      )
      .select([
        'MainHubUpgradeV001ForProducts.id',
        'MainHubUpgradeV001ForProducts.name',
        'MainHubUpgradeV001ForProducts.subtitle',
        'MainHubUpgradeV001ForProducts.description',
        'MainHubUpgradeV001ForProducts.price',
        'MainHubUpgradeV001ForProducts.image_url',
        'MainHubUpgradeV001ForProducts.store_type',
        'MainHubUpgradeV001ForProducts.user_id',
        'MainHubUpgradeV001ForProducts.store_id',
        'MainHubUpgradeV001ForProducts.payment_method',
        'MainHubUpgradeV001ForProducts.payment_url',
        'MainHubUpgradeV001ForProducts.sku_id',
        'MainHubUpgradeV001ForProducts.created_at',
        'users.username as creator_username',
      ])
      .where('MainHubUpgradeV001ForProducts.is_in_trash', '=', 0)
      .orderBy('MainHubUpgradeV001ForProducts.created_at', 'desc')
      .execute();

    // Deduplicate by product ID
    const seen = new Set<number>();
    const uniqueProducts = allProducts.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });

    console.log(`[PRODUCTS] Fetched ${uniqueProducts.length} unique products for Everything store (from all users and stores, deduped from ${allProducts.length})`);
    res.json(uniqueProducts);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching everything products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});


// POST - Move product to trash (soft delete)
router.post('/:productId/trash', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this product' });
      return;
    }

    // Move to trash
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ is_in_trash: 1 })
      .where('id', '=', parseInt(productId))
      .execute();

    // Create trash record
    await db
      .insertInto('MainHubUpgradeV001ForProductTrash')
      .values({
        product_id: parseInt(productId),
        user_id: req.user.userId,
      })
      .execute();

    res.json({ message: 'Product moved to trash' });
  } catch (error) {
    console.error('[PRODUCTS] Error moving to trash:', error);
    res.status(500).json({ message: 'Failed to move to trash' });
  }
});

// POST - Restore product from trash
router.post('/:productId/restore', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product || !product.is_in_trash) {
      res.status(404).json({ message: 'Product not found or not in trash' });
      return;
    }

    if (product.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this product' });
      return;
    }

    // Restore from trash
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ is_in_trash: 0 })
      .where('id', '=', parseInt(productId))
      .execute();

    // Remove from trash table
    await db
      .deleteFrom('MainHubUpgradeV001ForProductTrash')
      .where('product_id', '=', parseInt(productId))
      .execute();

    res.json({ message: 'Product restored' });
  } catch (error) {
    console.error('[PRODUCTS] Error restoring product:', error);
    res.status(500).json({ message: 'Failed to restore product' });
  }
});



// PATCH - Update product
router.patch('/:productId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if user owns the product OR is HIGH-HIGH-HIGH admin
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    const isAdmin = user && user.is_high_high_high_admin === 1;
    const isOwner = product.user_id === req.user.userId;

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'You do not have permission to edit this product' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.subtitle !== undefined) updateData.subtitle = req.body.subtitle || null;
    if (req.body.description !== undefined) updateData.description = req.body.description || null;
    if (req.body.price !== undefined) updateData.price = req.body.price ? parseFloat(req.body.price) : null;
    if (req.body.payment_method) updateData.payment_method = req.body.payment_method;
    if (req.body.payment_url !== undefined) updateData.payment_url = req.body.payment_url || null;
    if (req.body.sku_id !== undefined) updateData.sku_id = req.body.sku_id || null;
    if (req.body.store_id !== undefined) updateData.store_id = parseInt(req.body.store_id) || null;

    // Handle image upload if provided
    if ((req as any).files && (req as any).files.image) {
      await ensureUploadDir();
      const uploadedFile = (req as any).files.image;
      const uploadDir = path.join(process.cwd(), 'data', 'uploads');
      const filename = `${Date.now()}-${uploadedFile.name}`;
      const filepath = path.join(uploadDir, filename);

      await uploadedFile.mv(filepath);
      updateData.image_url = `/api/uploads/${filename}`;
    }

    // Update the product
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set(updateData)
      .where('id', '=', parseInt(productId))
      .execute();

    console.log(`[PRODUCTS] Product ${productId} updated by user ${req.user.userId}`);

    res.json({ message: 'Product updated successfully', productId: parseInt(productId) });
  } catch (error) {
    console.error('[PRODUCTS] Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});





// POST - Add item to internal cart
router.post('/cart/add', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { product_id, quantity = 1 } = req.body;

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', product_id)
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Add or update cart item
    const existingItem = await db
      .selectFrom('MainHubUpgradeV001ForInternalCart')
      .selectAll()
      .where('user_id', '=', req.user.userId)
      .where('product_id', '=', product_id)
      .executeTakeFirst();

    if (existingItem) {
      await db
        .updateTable('MainHubUpgradeV001ForInternalCart')
        .set({ quantity: existingItem.quantity + quantity })
        .where('id', '=', existingItem.id)
        .execute();
    } else {
      await db
        .insertInto('MainHubUpgradeV001ForInternalCart')
        .values({
          user_id: req.user.userId,
          product_id,
          quantity,
        })
        .execute();
    }

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('[PRODUCTS] Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// GET - Get user's cart
router.get('/cart', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const cartItems = await db
      .selectFrom('MainHubUpgradeV001ForInternalCart')
      .leftJoin(
        'MainHubUpgradeV001ForProducts',
        'MainHubUpgradeV001ForInternalCart.product_id',
        'MainHubUpgradeV001ForProducts.id'
      )
      .selectAll('MainHubUpgradeV001ForInternalCart')
      .selectAll('MainHubUpgradeV001ForProducts')
      .where('MainHubUpgradeV001ForInternalCart.user_id', '=', req.user.userId)
      .execute();

    res.json(cartItems);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// DELETE - Remove item from cart
router.delete('/cart/:itemId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { itemId } = req.params;

    const cartItem = await db
      .selectFrom('MainHubUpgradeV001ForInternalCart')
      .selectAll()
      .where('id', '=', parseInt(itemId))
      .executeTakeFirst();

    if (!cartItem || cartItem.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this cart item' });
      return;
    }

    await db
      .deleteFrom('MainHubUpgradeV001ForInternalCart')
      .where('id', '=', parseInt(itemId))
      .execute();

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('[PRODUCTS] Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

// POST - Add item to "Looking For"
router.post('/looking-for/add', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { store_id, item_name, description } = req.body;

  if (!store_id || !item_name) {
    res.status(400).json({ message: 'store_id and item_name are required' });
    return;
  }

  console.log(`[Looking For] User ${req.user.userId} adding item to store #${store_id}`);

  try {
    await db
      .insertInto('MainHubUpgradeV001ForLookingFor')
      .values({
        user_id: req.user.userId,
        store_id: parseInt(store_id),
        item_name,
        description: description || null,
      })
      .execute();

    res.json({ message: 'Item added to looking for' });
  } catch (error) {
    console.error('[PRODUCTS] Error adding to looking for:', error);
    res.status(500).json({ message: 'Failed to add to looking for' });
  }
});

// GET - Get "Looking For" items for a store
router.get('/looking-for/store/:storeId', async (req, res) => {
  const { storeId } = req.params;

  console.log(`[Looking For] Fetching items for store #${storeId}`);

  try {
    const items = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .selectAll()
      .where('store_id', '=', parseInt(storeId))
      .orderBy('created_at', 'desc')
      .execute();

    res.json(items);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching looking for items:', error);
    res.status(500).json({ message: 'Failed to fetch looking for items' });
  }
});

// GET - Get "Looking For" items for current user across all stores
router.get('/looking-for/user/:userId', async (req, res) => {
  const { userId } = req.params;

  console.log(`[Looking For] Fetching items for user ${userId}`);

  try {
    const items = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .selectAll()
      .where('user_id', '=', parseInt(userId))
      .orderBy('created_at', 'desc')
      .execute();

    res.json(items);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching user looking for items:', error);
    res.status(500).json({ message: 'Failed to fetch user looking for items' });
  }
});

// DELETE - Remove item from "Looking For"
router.delete('/looking-for/:itemId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { itemId } = req.params;

  console.log(`[Looking For] User ${req.user.userId} deleting item ${itemId}`);

  try {
    const item = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .selectAll()
      .where('id', '=', parseInt(itemId))
      .executeTakeFirst();

    if (!item || item.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this item' });
      return;
    }

    await db
      .deleteFrom('MainHubUpgradeV001ForLookingFor')
      .where('id', '=', parseInt(itemId))
      .execute();

    res.json({ message: 'Item removed from looking for' });
  } catch (error) {
    console.error('[PRODUCTS] Error removing from looking for:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// GET - All products (for HIGH-HIGH-HIGH admin viewing)
router.get('/admin/all', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Only HIGH-HIGH-HIGH admins can see all products
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_high_high_high_admin !== 1) {
      res.status(403).json({ message: 'Only HIGH-HIGH-HIGH admins can view all products' });
      return;
    }

    // Get ALL products from ALL sources, with creator info
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .leftJoin(
        'users',
        'MainHubUpgradeV001ForProducts.user_id',
        'users.id'
      )
      .select([
        'MainHubUpgradeV001ForProducts.id',
        'MainHubUpgradeV001ForProducts.name',
        'MainHubUpgradeV001ForProducts.subtitle',
        'MainHubUpgradeV001ForProducts.description',
        'MainHubUpgradeV001ForProducts.price',
        'MainHubUpgradeV001ForProducts.image_url',
        'MainHubUpgradeV001ForProducts.store_type',
        'MainHubUpgradeV001ForProducts.user_id',
        'MainHubUpgradeV001ForProducts.store_id',
        'MainHubUpgradeV001ForProducts.payment_method',
        'MainHubUpgradeV001ForProducts.payment_url',
        'MainHubUpgradeV001ForProducts.sku_id',
        'MainHubUpgradeV001ForProducts.created_at',
        'users.username as creator_username',
      ])
      .where('MainHubUpgradeV001ForProducts.is_in_trash', '=', 0)
      .orderBy('MainHubUpgradeV001ForProducts.created_at', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching admin products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }

// GET - Get products by high-high admin user (different from regular user products)
router.get('/high-high-admin/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;

  try {
    // Verify user is high-high admin
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', parseInt(userId))
      .executeTakeFirst();

    if (!user || user.is_high_high_admin !== 1) {
      res.status(400).json({ message: 'User is not a high-high admin' });
      return;
    }

    // Fetch all products added by this high-high admin across all stores
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('store_type', '=', 'store')
      .where('is_in_trash', '=', 0)
      .orderBy('id', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('[PRODUCTS] Error fetching high-high admin products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

  
});

// DELETE - Delete product as HIGH-HIGH-HIGH admin
router.delete('/admin/:productId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    // Check if user is HIGH-HIGH-HIGH admin
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user || user.is_high_high_high_admin !== 1) {
      res.status(403).json({ message: 'Only HIGH-HIGH-HIGH admins can delete products' });
      return;
    }

    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Move to trash
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ is_in_trash: 1 })
      .where('id', '=', parseInt(productId))
      .execute();

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('[PRODUCTS] Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});










// Add product to user store (update existing product)
router.put('/products/:productId/user-store', async (req, res) => {
  try {
    const { userStoreId } = req.body;
    const productId = parseInt(req.params.productId);

    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ user_store_id: userStoreId || null })
      .where('id', '=', productId)
      .execute();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product user store:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Get all user stores with their products (for quadrants page 10+)
router.get('/user-stores/all', async (req, res) => {
  try {
    const stores = await db
      .selectFrom('user_stores')
      .leftJoin('MainHubUpgradeV001ForProducts', 'user_stores.id', 'MainHubUpgradeV001ForProducts.user_store_id') 
      .select([
        'user_stores.id',
        'user_stores.name',
        'user_stores.subtitle',
        'user_stores.description',
        'user_stores.user_id',
        'MainHubUpgradeV001ForProducts.id as product_id',
        'MainHubUpgradeV001ForProducts.name as product_name',
        'MainHubUpgradeV001ForProducts.price',
        'MainHubUpgradeV001ForProducts.image_url',
        'MainHubUpgradeV001ForProducts.description as product_description',
      ])
      .orderBy('user_stores.created_at', 'desc')
      .execute();

    // Transform flat results into nested structure
    const storesMap = new Map();
    stores.forEach(row => {
      if (!storesMap.has(row.id)) {
        storesMap.set(row.id, {
          id: row.id,
          name: row.name,
          subtitle: row.subtitle,
          description: row.description,
          user_id: row.user_id,
          products: [],
        });
      }
      if (row.product_id) {
        storesMap.get(row.id).products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          image_url: row.image_url,
          description: row.product_description,
        });
      }
    });

    res.json(Array.from(storesMap.values()));
  } catch (error) {
    console.error('Error fetching user stores:', error);
    res.status(500).json({ error: 'Failed to fetch user stores' });
  }
});


// PUT - Assign product to user store (with full error handling & authentication)
router.put('/:productId/user-store', authenticate, async (req, res) => {
  if (!req.user) {
    console.log('[PRODUCTS] PUT user-store: No authenticated user');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;
  const { userStoreId } = req.body;

  console.log(`[PRODUCTS] PUT /:productId/user-store called: productId=${productId}, userStoreId=${userStoreId}, userId=${req.user.userId}`);

  // Validate productId is a number
  const parsedProductId = parseInt(productId);
  if (isNaN(parsedProductId)) {
    console.log('[PRODUCTS] Invalid productId:', productId);
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parsedProductId)
      .executeTakeFirst();

    if (!product) {
      console.log(`[PRODUCTS] Product ${parsedProductId} not found`);
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if user owns the product
    if (product.user_id !== req.user.userId) {
      console.log(`[PRODUCTS] User ${req.user.userId} does not own product ${parsedProductId} (owner: ${product.user_id})`);
      res.status(403).json({ message: 'You do not own this product' });
      return;
    }

    // Verify the user store exists and belongs to the user (if userStoreId is provided)
    if (userStoreId) {
      const parsedStoreId = parseInt(userStoreId);
      if (isNaN(parsedStoreId)) {
        console.log('[PRODUCTS] Invalid userStoreId:', userStoreId);
        res.status(400).json({ message: 'Invalid user store ID' });
        return;
      }

      const userStore = await db
        .selectFrom('user_stores')
        .selectAll()
        .where('id', '=', parsedStoreId)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!userStore) {
        console.log(`[PRODUCTS] User store ${parsedStoreId} not found for user ${req.user.userId}`);
        res.status(404).json({ message: 'User store not found or does not belong to you' });
        return;
      }

      console.log(`[PRODUCTS] Verified user store ${parsedStoreId} belongs to user ${req.user.userId}`);
    }

    // Update product with user store assignment
    const updatePayload: any = {};
    if (userStoreId) {
      updatePayload.user_store_id = parseInt(userStoreId);
    } else {
      updatePayload.user_store_id = null;
    }

    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set(updatePayload)
      .where('id', '=', parsedProductId)
      .execute();

    console.log(`[PRODUCTS] ✅ Product ${parsedProductId} assigned to user store ${userStoreId || 'null'} by user ${req.user.userId}`);
    res.status(200).json({ 
      message: 'Product updated successfully', 
      productId: parsedProductId,
      userStoreId: userStoreId ? parseInt(userStoreId) : null
    });
  } catch (error) {
    console.error('[PRODUCTS] ❌ Error updating product user store:', error);
    res.status(500).json({ 
      message: 'Failed to update product', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// GET - All user stores with their products (for page 10+ display)
router.get('/stores/all/with-products', async (req, res) => {
  try {
    console.log('[PRODUCTS] Fetching all user stores with their products');

    // Get all user stores with their associated products
    const stores = await db
      .selectFrom('user_stores')
      .leftJoin(
        'MainHubUpgradeV001ForProducts',
        'user_stores.id',
        'MainHubUpgradeV001ForProducts.user_store_id'
      )
      .leftJoin(
        'users',
        'user_stores.user_id',
        'users.id'
      )
      .select([
        'user_stores.id',
        'user_stores.name',
        'user_stores.subtitle',
        'user_stores.description',
        'user_stores.user_id',
        'user_stores.created_at as store_created_at',
        'MainHubUpgradeV001ForProducts.id as product_id',
        'MainHubUpgradeV001ForProducts.name as product_name',
        'MainHubUpgradeV001ForProducts.price',
        'MainHubUpgradeV001ForProducts.image_url',
        'MainHubUpgradeV001ForProducts.description as product_description',
        'MainHubUpgradeV001ForProducts.subtitle as product_subtitle',
        'users.username as store_owner_username',
      ])
      .where('MainHubUpgradeV001ForProducts.is_in_trash', '=', 0)
      .orderBy('user_stores.created_at', 'desc')
      .execute();

    // Transform flat results into nested structure
    const storesMap = new Map();
    stores.forEach(row => {
      if (!storesMap.has(row.id)) {
        storesMap.set(row.id, {
          id: row.id,
          name: row.name,
          subtitle: row.subtitle,
          description: row.description,
          user_id: row.user_id,
          store_owner_username: row.store_owner_username,
          created_at: row.store_created_at,
          products: [],
        });
      }
      if (row.product_id) {
        storesMap.get(row.id).products.push({
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          image_url: row.image_url,
          description: row.product_description,
          subtitle: row.product_subtitle,
        });
      }
    });

    const result = Array.from(storesMap.values());
    console.log(`[PRODUCTS] ✅ Fetched ${result.length} user stores with products`);
    res.json(result);
  } catch (error) {
    console.error('[PRODUCTS] ❌ Error fetching user stores with products:', error);
    res.status(500).json({ message: 'Failed to fetch user stores' });
  }
});




export default router;
