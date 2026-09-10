import Post from '../models/Post.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

// Helper: upload buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'social_posts',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// Helper: extract public_id from Cloudinary URL for deletion
const getCloudinaryPublicId = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1].split('.')[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename}`;
};

// Helper: format post for response (no passwords)
const formatPost = (post) => ({
  _id: post._id,
  user: {
    _id: post.user._id,
    username: post.user.username,
  },
  text: post.text || null,
  image: post.image || null,
  likes: post.likes.map((u) =>
    typeof u === 'object' ? { _id: u._id, username: u.username } : u
  ),
  likeCount: post.likes.length,
  comments: post.comments.map((c) => ({
    _id: c._id,
    user: {
      _id: c.user._id || c.user,
      username: c.user.username || null,
    },
    text: c.text,
    createdAt: c.createdAt,
  })),
  commentCount: post.comments.length,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

// @desc    Get all posts (paginated, newest first)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .populate('likes', 'username')
      .populate('comments.user', 'username');

    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: {
        posts: posts.map(formatPost),
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Protected
export const createPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const trimmedText = text ? text.trim() : '';
    const file = req.file;

    if (!trimmedText && !file) {
      return res.status(400).json({
        success: false,
        message: 'A post must contain text or an image',
      });
    }

    let imageUrl = null;

    if (file) {
      // Validate mime type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only JPEG, PNG, GIF, and WebP images are allowed',
        });
      }

      // 5MB max
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Image size cannot exceed 5MB',
        });
      }

      const result = await uploadToCloudinary(file.buffer, file.mimetype);
      imageUrl = result.secure_url;
    }

    const post = await Post.create({
      user: req.user._id,
      text: trimmedText || undefined,
      image: imageUrl,
    });

    // Populate for response
    const populated = await Post.findById(post._id)
      .populate('user', 'username')
      .populate('likes', 'username')
      .populate('comments.user', 'username');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: formatPost(populated) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or unlike a post (toggle)
// @route   POST /api/posts/:id/like
// @access  Protected
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const populated = await Post.findById(post._id)
      .populate('user', 'username')
      .populate('likes', 'username')
      .populate('comments.user', 'username');

    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      data: { post: formatPost(populated) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post (owner only)
// @route   PUT /api/posts/:id
// @access  Protected
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Server-side ownership check — never trust frontend
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts',
      });
    }

    const { text, removeImage } = req.body;
    const trimmedText = text !== undefined ? text.trim() : undefined;
    const file = req.file;

    // Determine what the new image will be
    let newImageUrl = post.image; // default: keep existing

    if (file) {
      // Validate MIME
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only JPEG, PNG, GIF, and WebP images are allowed',
        });
      }
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Image size cannot exceed 5MB',
        });
      }

      // Upload new image
      const result = await uploadToCloudinary(file.buffer, file.mimetype);
      const oldImageUrl = post.image;
      newImageUrl = result.secure_url;

      // Attempt to delete old Cloudinary asset — non-fatal if it fails
      if (oldImageUrl) {
        try {
          const publicId = getCloudinaryPublicId(oldImageUrl);
          await cloudinary.uploader.destroy(publicId);
        } catch {
          // Deletion failure does not abort the update
        }
      }
    } else if (removeImage === 'true' || removeImage === true) {
      // User explicitly chose to remove the image
      const oldImageUrl = post.image;
      newImageUrl = null;

      if (oldImageUrl) {
        try {
          const publicId = getCloudinaryPublicId(oldImageUrl);
          await cloudinary.uploader.destroy(publicId);
        } catch {
          // Non-fatal
        }
      }
    }
    // else: no file, no removeImage flag → keep existing image

    // Determine final text value
    const finalText = trimmedText !== undefined ? (trimmedText || undefined) : post.text;

    // Validate: post must have at least text or image
    if (!finalText && !newImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'A post must have either text or an image',
      });
    }

    post.text = finalText || undefined;
    post.image = newImageUrl;

    // Use save() so the pre-save validation hook runs
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('user', 'username')
      .populate('likes', 'username')
      .populate('comments.user', 'username');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: formatPost(populated) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post (owner only)
// @route   DELETE /api/posts/:id
// @access  Protected
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Server-side ownership check
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
    }

    // Attempt Cloudinary cleanup — non-fatal
    if (post.image) {
      try {
        const publicId = getCloudinaryPublicId(post.image);
        await cloudinary.uploader.destroy(publicId);
      } catch {
        // Non-fatal — proceed with DB deletion regardless
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: { postId: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Protected
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const trimmedText = text ? text.trim() : '';

    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty',
      });
    }

    if (trimmedText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot exceed 500 characters',
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.comments.push({
      user: req.user._id,
      text: trimmedText,
    });

    await post.save();

    const populated = await Post.findById(post._id)
      .populate('user', 'username')
      .populate('likes', 'username')
      .populate('comments.user', 'username');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { post: formatPost(populated) },
    });
  } catch (error) {
    next(error);
  }
};
