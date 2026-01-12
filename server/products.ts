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

  const { name, subtitle, description, price, payment_method, payment_url, store_id, sku_id, url } = req.body;

  // Validate required fields
  if (!name || price === undefined) {
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
    }

    // Determine store type based on user role
    let storeType: 'main' | 'user' | 'store' = 'user';
    let finalStoreId: number | null = null;

    if (user.is_high_high_high_admin === 1) {
      // HIGH-HIGH-HIGH admin: can add to main store
      storeType = 'main';
      finalStoreId = 0;
      console.log(`[PRODUCTS] HIGH-HIGH-HIGH admin ${user.username} adding to main store`);
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
        url: url || null,
        is_in_trash: 0,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    console.log(`[PRODUCTS] Product created: ${product.id} (${storeType}) by user ${req.user.userId}`);
    console.log(`[PRODUCTS] SKU: ${sku_id || 'none'}, URL: ${url || 'none'}`);

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

export default router;
