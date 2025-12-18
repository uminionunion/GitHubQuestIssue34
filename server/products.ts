import { Router } from 'express';
import { db } from './db.js';
import { authenticate } from './auth-middleware.js';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * POST /api/products
 * Create a new product
 * 
 * Body: {
 *   name: string (required)
 *   subtitle?: string
 *   description?: string
 *   price: number (required)
 *   payment_method: 'own_website' | 'venmo' | 'cash' | 'card_coming_soon' | 'other'
 *   payment_url?: string (Venmo/CashApp link)
 *   woo_sku?: string (WooCommerce SKU for linking)
 *   store_id?: number (0 for main, 1-30 for stores - only for admins)
 * }
 * File: image (multipart/form-data)
 * 
 * Response: { message, productId }
 */
router.post('/', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { name, subtitle, description, price, payment_method, payment_url, woo_sku, store_id } = req.body;

  // Validate required fields
  if (!name || !price) {
    res.status(400).json({ message: 'Name and price are required' });
    return;
  }

  try {
    // Check if user is blocked from selling
    const userRecord = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!userRecord) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (userRecord.is_blocked === 1) {
      res.status(403).json({ message: 'Your account has been blocked from selling' });
      return;
    }

    // Handle image upload
    let imageUrl = '';
    if (req.files && (req.files as any).image) {
      const imageFile = (req.files as any).image;
      const uploadDir = path.join(process.cwd(), 'data', 'uploads', 'products');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `${Date.now()}-${imageFile.name}`;
      const filepath = path.join(uploadDir, filename);
      
      await imageFile.mv(filepath);
      imageUrl = `/api/uploads/products/${filename}`;
    }

    // Determine product type and store
    let finalStoreId = 0;
    let storeType = 'user';

    // Only high-high-high admins can add to main store (store 0) or other stores
    if (userRecord.is_high_high_high_admin === 1) {
      finalStoreId = store_id ? parseInt(store_id as any) : 0;
      storeType = 'main';
    } else {
      // Regular users add to their own store
      storeType = 'user';
      finalStoreId = 0; // User products default to 0 but are marked as 'user' type
    }

    // Create the product
    const product = await db
      .insertInto('MainHubUpgradeV001ForProducts')
      .values({
        name,
        subtitle: subtitle || null,
        description: description || null,
        price: parseFloat(price as any),
        image_url: imageUrl,
        store_type: storeType,
        user_id: storeType === 'user' ? req.user.userId : null,
        store_id: finalStoreId,
        payment_method: payment_method || 'own_website',
        payment_url: payment_url || null,
        woo_commerce_sku: woo_sku || null,
        is_in_trash: 0
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    console.log(`Product created: ${name} by user ${req.user.username}, store_id: ${finalStoreId}`);

    res.status(201).json({
      message: 'Product created successfully',
      productId: product.id
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/store/:storeId
 * Get all products from a specific store
 * 
 * Params: storeId (0 = main, 1-30 = chatroom stores)
 * 
 * Response: Array of products
 */
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

    console.log(`Fetched ${products.length} products from store ${storeId}`);

    res.json(products);
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/store/:storeId/featured
 * Get featured (top 3) products from a store
 * 
 * Params: storeId
 * 
 * Response: Array of featured products
 */
router.get('/store/:storeId/featured', async (req, res) => {
  const { storeId } = req.params;

  try {
    const featured = await db
      .selectFrom('MainHubUpgradeV001ForFeaturedProducts')
      .leftJoin(
        'MainHubUpgradeV001ForProducts',
        'MainHubUpgradeV001ForFeaturedProducts.product_id',
        'MainHubUpgradeV001ForProducts.id'
      )
      .selectAll()
      .where('MainHubUpgradeV001ForFeaturedProducts.store_id', '=', parseInt(storeId))
      .orderBy('position', 'asc')
      .execute();

    res.json(featured);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/user/:userId
 * Get all products created by a specific user
 * 
 * Params: userId
 * Query: storeId? (optional, filter by store)
 * 
 * Response: Array of products
 */
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { storeId } = req.query;

  try {
    let query = db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('user_id', '=', parseInt(userId))
      .where('is_in_trash', '=', 0)
      .where('store_type', '=', 'user');

    if (storeId) {
      query = query.where('store_id', '=', parseInt(storeId as string));
    }

    const products = await query.orderBy('created_at', 'desc').execute();

    console.log(`Fetched ${products.length} products for user ${userId}`);

    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/user-stores
 * Get all products from all user stores (not main store)
 * 
 * Response: Array of all user products
 */
router.get('/user-stores', async (req, res) => {
  try {
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('store_type', '=', 'user')
      .where('is_in_trash', '=', 0)
      .orderBy('created_at', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('Error fetching user store products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/friends-stores
 * Get products from friends' stores (requires auth)
 * 
 * Response: Array of friends' products
 */
router.get('/friends-stores', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Get user's friends
    const friends = await db
      .selectFrom('friends')
      .select('friend_id')
      .where('user_id', '=', req.user.userId)
      .where('status', '=', 'accepted')
      .execute();

    const friendIds = friends.map(f => f.friend_id);

    if (friendIds.length === 0) {
      res.json([]);
      return;
    }

    // Get products from friends
    const products = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('user_id', 'in', friendIds)
      .where('store_type', '=', 'user')
      .where('is_in_trash', '=', 0)
      .orderBy('created_at', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('Error fetching friends store products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/products/:productId/trash
 * Move a product to trash (soft delete)
 * 
 * Params: productId
 * 
 * Response: { message }
 */
router.post('/:productId/trash', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId } = req.params;

  try {
    // Verify ownership
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', parseInt(productId))
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Only owner or admin can delete
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    const isOwner = product.user_id === req.user.userId;
    const isAdmin = user?.is_high_high_high_admin === 1;

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: 'You do not own this product' });
      return;
    }

    // Mark as in trash
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ is_in_trash: 1 })
      .where('id', '=', parseInt(productId))
      .execute();

    // Log to trash table
    await db
      .insertInto('MainHubUpgradeV001ForProductTrash')
      .values({
        product_id: parseInt(productId),
        user_id: req.user.userId
      })
      .execute();

    console.log(`Product ${productId} moved to trash by user ${req.user.username}`);

    res.json({ message: 'Product moved to trash' });
  } catch (error) {
    console.error('Error moving product to trash:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/products/:productId/recover
 * Recover a product from trash (undo soft delete)
 * 
 * Params: productId
 * 
 * Response: { message }
 */
router.post('/:productId/recover', authenticate, async (req, res) => {
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

    // Only owner can recover
    if (product.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You cannot recover this product' });
      return;
    }

    // Restore from trash
    await db
      .updateTable('MainHubUpgradeV001ForProducts')
      .set({ is_in_trash: 0 })
      .where('id', '=', parseInt(productId))
      .execute();

    console.log(`Product ${productId} recovered by user ${req.user.username}`);

    res.json({ message: 'Product recovered from trash' });
  } catch (error) {
    console.error('Error recovering product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/products/cart/add
 * Add product to internal cart (Where to Buy cart)
 * 
 * Body: {
 *   product_id: number (required)
 *   quantity?: number (default 1)
 * }
 * 
 * Response: { message }
 */
router.post('/cart/add', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { product_id, quantity = 1 } = req.body;

  try {
    // Check if product exists and is a user product
    const product = await db
      .selectFrom('MainHubUpgradeV001ForProducts')
      .selectAll()
      .where('id', '=', product_id)
      .executeTakeFirst();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Only user store products can go in internal cart
    if (product.store_type !== 'user') {
      res.status(400).json({ message: 'Only user products can be added to internal cart' });
      return;
    }

    // Check if item already in cart
    const existingItem = await db
      .selectFrom('MainHubUpgradeV001ForInternalCart')
      .selectAll()
      .where('user_id', '=', req.user.userId)
      .where('product_id', '=', product_id)
      .executeTakeFirst();

    if (existingItem) {
      // Update quantity
      await db
        .updateTable('MainHubUpgradeV001ForInternalCart')
        .set({ quantity: existingItem.quantity + quantity })
        .where('id', '=', existingItem.id)
        .execute();
    } else {
      // Insert new cart item
      await db
        .insertInto('MainHubUpgradeV001ForInternalCart')
        .values({
          user_id: req.user.userId,
          product_id,
          quantity
        })
        .execute();
    }

    console.log(`Product ${product_id} added to cart for user ${req.user.username}`);

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/cart
 * Get user's internal cart
 * 
 * Response: Array of cart items with product details
 */
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
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/products/cart/:itemId
 * Remove item from internal cart
 * 
 * Params: itemId (cart item ID, not product ID)
 * 
 * Response: { message }
 */
router.delete('/cart/:itemId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { itemId } = req.params;

  try {
    // Verify ownership
    const cartItem = await db
      .selectFrom('MainHubUpgradeV001ForInternalCart')
      .selectAll()
      .where('id', '=', parseInt(itemId))
      .executeTakeFirst();

    if (!cartItem) {
      res.status(404).json({ message: 'Cart item not found' });
      return;
    }

    if (cartItem.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this cart item' });
      return;
    }

    // Delete cart item
    await db
      .deleteFrom('MainHubUpgradeV001ForInternalCart')
      .where('id', '=', parseInt(itemId))
      .execute();

    console.log(`Cart item ${itemId} removed for user ${req.user.username}`);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/products/looking-for/add
 * Add item to "What I'm Looking For" list
 * 
 * Body: {
 *   store_id: number (which store they're looking for items in)
 *   item_description: string (what they're looking for)
 * }
 * 
 * Response: { message, lookingForId }
 */
router.post('/looking-for/add', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { store_id, item_description } = req.body;

  if (!store_id || !item_description) {
    res.status(400).json({ message: 'Store ID and item description are required' });
    return;
  }

  try {
    const lookingFor = await db
      .insertInto('MainHubUpgradeV001ForLookingFor')
      .values({
        user_id: req.user.userId,
        store_id: parseInt(store_id as any),
        item_description,
        is_active: 1
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    console.log(`Looking for item added by user ${req.user.username}: ${item_description}`);

    res.json({ message: 'Item added to looking for list', lookingForId: lookingFor.id });
  } catch (error) {
    console.error('Error adding looking for item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/looking-for/store/:storeId
 * Get all "What I'm Looking For" items in a store
 * 
 * Params: storeId
 * 
 * Response: Array of looking for items
 */
router.get('/looking-for/store/:storeId', async (req, res) => {
  const { storeId } = req.params;

  try {
    const lookingFor = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .leftJoin('users', 'MainHubUpgradeV001ForLookingFor.user_id', 'users.id')
      .select([
        'MainHubUpgradeV001ForLookingFor.id',
        'MainHubUpgradeV001ForLookingFor.item_description',
        'MainHubUpgradeV001ForLookingFor.created_at',
        'users.username'
      ])
      .where('MainHubUpgradeV001ForLookingFor.store_id', '=', parseInt(storeId))
      .where('MainHubUpgradeV001ForLookingFor.is_active', '=', 1)
      .orderBy('MainHubUpgradeV001ForLookingFor.created_at', 'desc')
      .execute();

    res.json(lookingFor);
  } catch (error) {
    console.error('Error fetching looking for items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/products/looking-for/user/:userId
 * Get "What I'm Looking For" items for a specific user
 * 
 * Params: userId
 * 
 * Response: Array of user's looking for items
 */
router.get('/looking-for/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const lookingFor = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .selectAll()
      .where('user_id', '=', parseInt(userId))
      .where('is_active', '=', 1)
      .orderBy('created_at', 'desc')
      .execute();

    res.json(lookingFor);
  } catch (error) {
    console.error('Error fetching user looking for items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/products/looking-for/:lookingForId
 * Delete a "What I'm Looking For" item
 * 
 * Params: lookingForId
 * 
 * Response: { message }
 */
router.delete('/looking-for/:lookingForId', authenticate, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { lookingForId } = req.params;

  try {
    // Verify ownership
    const lookingFor = await db
      .selectFrom('MainHubUpgradeV001ForLookingFor')
      .selectAll()
      .where('id', '=', parseInt(lookingForId))
      .executeTakeFirst();

    if (!lookingFor) {
      res.status(404).json({ message: 'Looking for item not found' });
      return;
    }

    if (lookingFor.user_id !== req.user.userId) {
      res.status(403).json({ message: 'You do not own this item' });
      return;
    }

    // Soft delete
    await db
      .updateTable('MainHubUpgradeV001ForLookingFor')
      .set({ is_active: 0 })
      .where('id', '=', parseInt(lookingForId))
      .execute();

    res.json({ message: 'Item removed from looking for list' });
  } catch (error) {
    console.error('Error deleting looking for item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;