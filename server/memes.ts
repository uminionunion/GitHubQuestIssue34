import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { sql } from 'kysely';
import { requireAuth } from './auth-middleware.js';

const router = Router();

// ==========================================
// POSTS ROUTES
// ==========================================

// Get all posts for "Most Viral" page (5+ upvotes, random order)
router.get('/api/memes/posts/viral', async (req: Request, res: Response) => {
  try {
    console.log('[MEME API] Fetching viral posts (5+ upvotes)');
    const posts = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('upvotes', '>=', 5)
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();
    
    // Return with randomized order
    const randomized = posts.sort(() => Math.random() - 0.5);
    res.json(randomized);
  } catch (error) {
    console.error('[MEME API] Error fetching viral posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get all posts for "User Submitted" page (any posts not yet viral)
router.get('/api/memes/posts/user-submitted', async (req: Request, res: Response) => {
  try {
    console.log('[MEME API] Fetching user-submitted posts (<5 upvotes)');
    const posts = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('upvotes', '<', 5)
      .where('downvotes', '<', 10)  // Not auto-deleted
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();
    
    res.json(posts);
  } catch (error) {
    console.error('[MEME API] Error fetching user-submitted posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get post with all images
router.get('/api/memes/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[MEME API] Fetching post', id);
    
    const post = await db
      .selectFrom('MemeImplementation001Posts')
      .selectAll()
      .where('id', '=', parseInt(id))
      .executeTakeFirst();
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const images = await db
      .selectFrom('MemeImplementation001Images')
      .selectAll()
      .where('post_id', '=', post.id)
      .orderBy('display_order', 'asc')
      .execute();

    res.json({ ...post, images });
  } catch (error) {
    console.error('[MEME API] Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post (with images)
router.post('/api/memes/posts', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, images } = req.body;
    const userId = (req as any).user?.userId;

    if (!title || !images || images.length === 0) {
      return res.status(400).json({ error: 'Title and images required' });
    }

    console.log('[MEME API] Creating post for user', userId, 'with', images.length, 'images');

    // Create post
    const postResult = await db
      .insertInto('MemeImplementation001Posts')
      .values({
        user_id: userId,
        title,
        description: description || null,
        upvotes: 0,
        downvotes: 0,
      })
      .executeTakeFirstOrThrow();

    const postId = Number(postResult.insertId);

    // Add images
    for (let i = 0; i < images.length; i++) {
      await db
        .insertInto('MemeImplementation001Images')
        .values({
          post_id: postId,
          image_url: images[i].url,
          title: images[i].title || null,
          description: images[i].description || null,
          display_order: i,
        })
        .execute();
    }

    console.log('[MEME API] ✅ Post created with ID', postId);
    res.status(201).json({ id: postId, message: 'Post created' });
  } catch (error) {
    console.error('[MEME API] Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Delete post (auto-triggered when downvotes >= 10)
router.delete('/api/memes/posts/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    console.log('[MEME API] Deleting post', id);

    // Delete post (cascades to images, comments, votes)
    await db
      .deleteFrom('MemeImplementation001Posts')
      .where('id', '=', parseInt(id))
      .where('user_id', '=', userId)
      .execute();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('[MEME API] Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ==========================================
// VOTING ROUTES
// ==========================================

// Upvote post
router.post('/api/memes/posts/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const postId = parseInt(id);

    console.log('[MEME API] User', userId, 'upvoting post', postId);

    // Check if user already voted
    const existingVote = await db
      .selectFrom('MemeImplementation001PostVotes')
      .select(['id', 'vote_type'])
      .selectAll()
      .where('post_id', '=', postId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingVote) {
      if (existingVote.vote_type === 1) {
        // Remove upvote
        await db
          .deleteFrom('MemeImplementation001PostVotes')
          .where('post_id', '=', postId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Posts')
          .set({ upvotes: sql<number>`upvotes - 1` })
          .where('id', '=', postId)
          .execute();
      } else {
        // Change from downvote to upvote
        await db
          .updateTable('MemeImplementation001PostVotes')
          .set({ vote_type: 1 })
          .where('post_id', '=', postId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Posts')
          .set({
            upvotes: sql<number>`upvotes + 1`,
            downvotes: sql<number>`downvotes - 1`,
          })
          .where('id', '=', postId)
          .execute();
      }
    } else {
      // New upvote
      await db
        .insertInto('MemeImplementation001PostVotes')
        .values({ post_id: postId, user_id: userId, vote_type: 1 })
        .execute();

      await db
        .updateTable('MemeImplementation001Posts')
        .set({ upvotes: sql<number>`upvotes + 1` })
        .where('id', '=', postId)
        .execute();
    }

    console.log('[MEME API] ✅ Upvote processed');
    res.json({ message: 'Upvote recorded' });
  } catch (error) {
    console.error('[MEME API] Error upvoting:', error);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// Downvote post (with auto-delete at 10 downvotes)
router.post('/api/memes/posts/:id/downvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const postId = parseInt(id);

    console.log('[MEME API] User', userId, 'downvoting post', postId);

    // Check if user already voted
    const existingVote = await db
      .selectFrom('MemeImplementation001PostVotes')
      .selectAll()
      .select(['id', 'vote_type'])
      .where('post_id', '=', postId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingVote) {
      if (existingVote.vote_type === -1) {
        // Remove downvote
        await db
          .deleteFrom('MemeImplementation001PostVotes')
          .where('post_id', '=', postId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Posts')
          .set({ downvotes: sql<number>`downvotes - 1` })
          .where('id', '=', postId)
          .execute();
      } else {
        // Change from upvote to downvote
        await db
          .updateTable('MemeImplementation001PostVotes')
          .set({ vote_type: -1 })
          .where('post_id', '=', postId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Posts')
          .set({
            downvotes: sql<number>`downvotes + 1`,
            upvotes: sql<number>`upvotes - 1`,
          })
          .where('id', '=', postId)
          .execute();
      }
    } else {
      // New downvote
      await db
        .insertInto('MemeImplementation001PostVotes')
        .values({ post_id: postId, user_id: userId, vote_type: -1 })
        .execute();

      await db
        .updateTable('MemeImplementation001Posts')
        .set({ downvotes: sql<number>`downvotes + 1` })
        .where('id', '=', postId)
        .execute();
    }

    // Check if post should be auto-deleted (10+ downvotes)
    const post = await db
      .selectFrom('MemeImplementation001Posts')
      .select(['id', 'downvotes'])
      .where('id', '=', postId)
      .executeTakeFirst();

    if (post && post.downvotes >= 10) {
      console.log('[MEME API] ⚠️ Auto-deleting post', postId, 'due to 10+ downvotes');
      await db
        .deleteFrom('MemeImplementation001Posts')
        .where('id', '=', postId)
        .execute();
      return res.json({ message: 'Downvoted. Post auto-deleted due to too many downvotes' });
    }

    console.log('[MEME API] ✅ Downvote processed');
    res.json({ message: 'Downvote recorded' });
  } catch (error) {
    console.error('[MEME API] Error downvoting:', error);
    res.status(500).json({ error: 'Failed to downvote' });
  }
});

// ==========================================
// COMMENTS ROUTES
// ==========================================

// Get all comments for a post
router.get('/api/memes/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[MEME API] Fetching comments for post', id);

    const comments = await db
      .selectFrom('MemeImplementation001Comments')
      .selectAll()
      .where('post_id', '=', parseInt(id))
      .orderBy('upvotes', 'desc')
      .orderBy('created_at', 'desc')
      .execute();

    res.json(comments);
  } catch (error) {
    console.error('[MEME API] Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to post
router.post('/api/memes/posts/:id/comments', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const userId = (req as any).user?.userId;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description required' });
    }

    console.log('[MEME API] Creating comment for post', id, 'by user', userId);

    const result = await db
      .insertInto('MemeImplementation001Comments')
      .values({
        post_id: parseInt(id),
        user_id: userId,
        title: title || null,
        description: description || null,
        image_url: image || null,
        upvotes: 0,
        downvotes: 0,
      })
      .executeTakeFirstOrThrow();

    console.log('[MEME API] ✅ Comment created with ID', result.insertId);
    res.status(201).json({ id: result.insertId, message: 'Comment added' });
  } catch (error) {
    console.error('[MEME API] Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete comment
router.delete('/api/memes/comments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    console.log('[MEME API] Deleting comment', id);

    await db
      .deleteFrom('MemeImplementation001Comments')
      .where('id', '=', parseInt(id))
      .where('user_id', '=', userId)
      .execute();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('[MEME API] Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Upvote comment
router.post('/api/memes/comments/:id/upvote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const commentId = parseInt(id);

    console.log('[MEME API] User', userId, 'upvoting comment', commentId);

    const existingVote = await db
      .selectFrom('MemeImplementation001CommentVotes')
      .selectAll()
      .select(['id', 'vote_type'])
      .where('comment_id', '=', commentId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (existingVote) {
      if (existingVote.vote_type === 1) {
        await db
          .deleteFrom('MemeImplementation001CommentVotes')
          .where('comment_id', '=', commentId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Comments')
          .set({ upvotes: sql<number>`upvotes - 1` })
          .where('id', '=', commentId)
          .execute();
      } else {
        await db
          .updateTable('MemeImplementation001CommentVotes')
          .set({ vote_type: 1 })
          .where('comment_id', '=', commentId)
          .where('user_id', '=', userId)
          .execute();

        await db
          .updateTable('MemeImplementation001Comments')
          .set({
            upvotes: sql<number>`upvotes + 1`,
            downvotes: sql<number>`downvotes - 1`,
          })
          .where('id', '=', commentId)
          .execute();
      }
    } else {
      await db
        .insertInto('MemeImplementation001CommentVotes')
        .values({ comment_id: commentId, user_id: userId, vote_type: 1 })
        .execute();

      await db
        .updateTable('MemeImplementation001Comments')
        .set({ upvotes: sql<number>`upvotes + 1` })
        .where('id', '=', commentId)
        .execute();
    }

    console.log('[MEME API] ✅ Comment upvote processed');
    res.json({ message: 'Comment upvoted' });
  } catch (error) {
    console.error('[MEME API] Error upvoting comment:', error);
    res.status(500).json({ error: 'Failed to upvote comment' });
  }
});

export default router;
