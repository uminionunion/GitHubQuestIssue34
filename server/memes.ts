// server/memes.ts
import { Router, Request, Response } from 'express';
import { db } from './db.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const router = Router();

// Middleware to verify auth token
const getAuthUser = (req: Request) => {
  const token = req.cookies?.token;
  if (!token) return null;
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key') as any;
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
};

// POST: Upload post with streaming (FormData)
router.post('/api/memes/posts', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { title, description } = req.body;
    const files = req.files as any;

    if (!title?.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    if (!files || !files.images) {
      res.status(400).json({ error: 'No images/videos provided' });
      return;
    }

    // Normalize to array
    const imageArray = Array.isArray(files.images) ? files.images : [files.images];

    // Create posts directory
    const postsDir = path.join(process.cwd(), 'data', 'meme-posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    // Insert post into database
    const newPost = await db
      .insertInto('MemeImplementation001Posts')
      .values({
        user_id: authUser.userId,
        title: title.trim(),
        description: description?.trim() || '',
        upvotes: 0,
        downvotes: 0,
      })
      .returning('id')
      .executeTakeFirst();

    if (!newPost) {
      res.status(500).json({ error: 'Failed to create post' });
      return;
    }

    const postId = newPost.id;

    // Save each image/video to disk
    const savedImages: string[] = [];
    for (const file of imageArray) {
      const ext = path.extname(file.name);
      const filename = `${postId}-${crypto.randomBytes(4).toString('hex')}${ext}`;
      const filepath = path.join(postsDir, filename);

      await file.mv(filepath);
      savedImages.push(`/data/meme-posts/${filename}`);

      // Insert image record
      await db
        .insertInto('MemeImplementation001Images')
        .values({
          post_id: postId,
          image_url: `/data/meme-posts/${filename}`,
          display_order: savedImages.length - 1,
        })
        .execute();
    }

    console.log(`[MEMEBOX] ✅ Post created with ID: ${postId}, user: ${authUser.username}`);

    res.status(200).json({
      id: postId,
      title,
      description,
      images: savedImages,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      user_id: authUser.userId,
      username: authUser.username,
      comments: [],
    });
  } catch (error) {
    console.error('[MEMEBOX] Error uploading post:', error);
    res.status(500).json({ error: 'Failed to upload post' });
  }
});




router.get('/api/memes/posts/user-submitted', async (req: Request, res: Response) => {
  try {
    console.log('[MEME API] Fetching user-submitted posts (<5 upvotes)');
    
    // Get userId from token if logged in
    let userId: number | null = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key') as any;
        userId = payload.userId;
      } catch {
        // Invalid token, continue as anonymous
      }
    }

    const posts = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('upvotes', '<', 5)
      .where('downvotes', '<', 10)
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();

    // Enhance posts with images and favorite status
    const postsWithData = await Promise.all(posts.map(async (post) => {
      const images = await db
        .selectFrom('MemeImplementation001Images')
        .select('image_url')
        .where('post_id', '=', post.id)
        .orderBy('display_order', 'asc')
        .execute();

      // Check if favorited by current user
      let isFavorited = false;
      if (userId) {
        const favorite = await db
          .selectFrom('MemeImplementation001Favorites')
          .select('id')
          .where('post_id', '=', post.id)
          .where('user_id', '=', userId)
          .executeTakeFirst();
        isFavorited = !!favorite;
      }

      return {
        id: post.id,
        title: post.title,
        description: post.description,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        image_base64: images.length > 0 ? images[0].image_url : null,
        created_at: post.created_at,
        isFavorited,  // ← ADD THIS
      };
    }));

    res.json(postsWithData);
  } catch (error) {
    console.error('[MEME API] Error fetching user-submitted posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});











// GET: Fetch all posts with vote counts
router.get('/api/memes/posts', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);

    const posts = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute();

    const postsWithData = await Promise.all(posts.map(async (post) => {
      const images = await db
        .selectFrom('MemeImplementation001Images')
        .select(['image_url'])
        .where('post_id', '=', post.id)
        .orderBy('display_order', 'asc')
        .execute();

      const comments = await db
        .selectFrom('MemeImplementation001Comments')
        .select(['id', 'user_id', 'title', 'description', 'image_url', 'upvotes', 'downvotes', 'created_at'])
        .where('post_id', '=', post.id)
        .orderBy('created_at', 'desc')
        .execute();

      // Get user's vote on this post (if authenticated)
      let userVote = null;
      if (authUser) {
        const voteRecord = await db
          .selectFrom('MemeImplementation001PostVotes')
          .select('vote_type')
          .where('post_id', '=', post.id)
          .where('user_id', '=', authUser.userId)
          .executeTakeFirst();
        
        userVote = voteRecord?.vote_type || null;
      }

      // ✅ NEW: Check if post is favorited by current user
      let isFavorited = false;
      if (authUser) {
        const favorite = await db
          .selectFrom('MemeImplementation001Favorites')
          .select('id')
          .where('post_id', '=', post.id)
          .where('user_id', '=', authUser.userId)
          .executeTakeFirst();
        
        isFavorited = !!favorite;
      }

      return {
        id: post.id,
        user_id: post.user_id,
        title: post.title,
        description: post.description,
        images: images.map(i => i.image_url),
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        userVote,
        timestamp: new Date(post.created_at!),
        comments: comments.map(c => ({
          id: c.id,
          user_id: c.user_id,
          title: c.title,
          description: c.description,
          image: c.image_url,
          upvotes: c.upvotes,
          downvotes: c.downvotes,
          userVote: null,
          timestamp: new Date(c.created_at!),
          hidden: false,
        })),
        isFavorited,  // ✅ Now uses database value
      };
    }));

    res.status(200).json(postsWithData);
  } catch (error) {
    console.error('[MEMEBOX] Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST: Upvote post
router.post('/api/memes/posts/:postId/upvote', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    // Get current vote
    const currentVote = await db
      .selectFrom('MemeImplementation001PostVotes')
      .select('vote_type')
      .where('post_id', '=', postId)
      .where('user_id', '=', authUser.userId)
      .executeTakeFirst();

    const post = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('id', '=', postId)
      .executeTakeFirst();

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;
    let newVoteType: number | null = null;

    if (currentVote) {
      if (currentVote.vote_type === 1) {
        // Remove upvote
        newUpvotes--;
        await db
          .deleteFrom('MemeImplementation001PostVotes')
          .where('post_id', '=', postId)
          .where('user_id', '=', authUser.userId)
          .execute();
      } else if (currentVote.vote_type === -1) {
        // Change downvote to upvote
        newDownvotes--;
        newUpvotes++;
        newVoteType = 1;
        await db
          .updateTable('MemeImplementation001PostVotes')
          .set({ vote_type: 1 })
          .where('post_id', '=', postId)
          .where('user_id', '=', authUser.userId)
          .execute();
      }
    } else {
      // Add new upvote
      newUpvotes++;
      newVoteType = 1;
      await db
        .insertInto('MemeImplementation001PostVotes')
        .values({
          post_id: postId,
          user_id: authUser.userId,
          vote_type: 1,
        })
        .execute();
    }

    // Update post counts
    await db
      .updateTable('MemeImplementation001Posts')
      .set({ upvotes: newUpvotes, downvotes: newDownvotes })
      .where('id', '=', postId)
      .execute();

    res.status(200).json({ upvotes: newUpvotes, downvotes: newDownvotes, userVote: newVoteType });
  } catch (error) {
    console.error('[MEMEBOX] Error upvoting:', error);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// POST: Downvote post
router.post('/api/memes/posts/:postId/downvote', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    const currentVote = await db
      .selectFrom('MemeImplementation001PostVotes')
      .select('vote_type')
      .where('post_id', '=', postId)
      .where('user_id', '=', authUser.userId)
      .executeTakeFirst();

    const post = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('id', '=', postId)
      .executeTakeFirst();

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;
    let newVoteType: number | null = null;

    if (currentVote) {
      if (currentVote.vote_type === -1) {
        // Remove downvote
        newDownvotes--;
        await db
          .deleteFrom('MemeImplementation001PostVotes')
          .where('post_id', '=', postId)
          .where('user_id', '=', authUser.userId)
          .execute();
      } else if (currentVote.vote_type === 1) {
        // Change upvote to downvote
        newUpvotes--;
        newDownvotes++;
        newVoteType = -1;
        await db
          .updateTable('MemeImplementation001PostVotes')
          .set({ vote_type: -1 })
          .where('post_id', '=', postId)
          .where('user_id', '=', authUser.userId)
          .execute();
      }
    } else {
      // Add new downvote
      newDownvotes++;
      newVoteType = -1;
      await db
        .insertInto('MemeImplementation001PostVotes')
        .values({
          post_id: postId,
          user_id: authUser.userId,
          vote_type: -1,
        })
        .execute();
    }

    // Update post counts
    await db
      .updateTable('MemeImplementation001Posts')
      .set({ upvotes: newUpvotes, downvotes: newDownvotes })
      .where('id', '=', postId)
      .execute();

    res.status(200).json({ upvotes: newUpvotes, downvotes: newDownvotes, userVote: newVoteType });
  } catch (error) {
    console.error('[MEMEBOX] Error downvoting:', error);
    res.status(500).json({ error: 'Failed to downvote' });
  }
});

// POST: Add comment
router.post('/api/memes/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const postId = parseInt(req.params.postId, 10);
    const { title, description } = req.body;
    const files = req.files as any;

    if (!title?.trim() || !description?.trim()) {
      res.status(400).json({ error: 'Title and description required' });
      return;
    }

    let imageUrl: string | null = null;

    // Save comment image if provided
    if (files?.commentImage) {
      const commentsDir = path.join(process.cwd(), 'data', 'meme-comments');
      if (!fs.existsSync(commentsDir)) {
        fs.mkdirSync(commentsDir, { recursive: true });
      }

      const file = files.commentImage;
      const ext = path.extname(file.name);
      const filename = `${postId}-${authUser.userId}-${Date.now()}${ext}`;
      const filepath = path.join(commentsDir, filename);

      await file.mv(filepath);
      imageUrl = `/data/meme-comments/${filename}`;
    }

    // Insert comment into database
    const comment = await db
      .insertInto('MemeImplementation001Comments')
      .values({
        post_id: postId,
        user_id: authUser.userId,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        upvotes: 0,
        downvotes: 0,
      })
      .returning('id')
      .executeTakeFirst();

    console.log(`[MEMEBOX] ✅ Comment created with ID: ${comment?.id}, user: ${authUser.username}`);

    res.status(200).json({
      id: comment?.id,
      user_id: authUser.userId,
      title,
      description,
      image: imageUrl,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      timestamp: new Date(),
      hidden: false,
    });
  } catch (error) {
    console.error('[MEMEBOX] Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// DELETE: Delete post (only creator can delete)
router.delete('/api/memes/posts/:postId', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    // Get post to verify ownership
    const post = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('id', '=', postId)
      .executeTakeFirst();

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.user_id !== authUser.userId) {
      res.status(403).json({ error: 'You can only delete your own posts' });
      return;
    }

    // Delete post (cascade deletes images, comments, votes)
    await db
      .deleteFrom('MemeImplementation001Posts')
      .where('id', '=', postId)
      .execute();

    console.log(`[MEMEBOX] ✅ Post deleted with ID: ${postId}`);

    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('[MEMEBOX] Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});



// POST: Favorite/Unfavorite a post
router.post('/api/memes/posts/:postId/favorite', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }

    // Check if post exists
    const post = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('id', '=', postId)
      .executeTakeFirst();

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check if already favorited
    const existingFavorite = await db
      .selectFrom('MemeImplementation001Favorites')
      .select('id')
      .where('post_id', '=', postId)
      .where('user_id', '=', authUser.userId)
      .executeTakeFirst();

    let isFavorited = false;

    if (existingFavorite) {
      // Remove favorite
      await db
        .deleteFrom('MemeImplementation001Favorites')
        .where('post_id', '=', postId)
        .where('user_id', '=', authUser.userId)
        .execute();
      console.log(`[MEMEBOX] ✅ Removed favorite: post ${postId}, user ${authUser.username}`);
    } else {
      // Add favorite
      await db
        .insertInto('MemeImplementation001Favorites')
        .values({
          post_id: postId,
          user_id: authUser.userId,
        })
        .execute();
      isFavorited = true;
      console.log(`[MEMEBOX] ✅ Added favorite: post ${postId}, user ${authUser.username}`);
    }

    res.status(200).json({ isFavorited });
  } catch (error) {
    console.error('[MEMEBOX] Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});




// ==========================================
// FAVORITES ROUTES
// ==========================================






export default router;
