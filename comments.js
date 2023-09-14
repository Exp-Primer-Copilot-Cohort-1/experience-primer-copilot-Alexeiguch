// Create web server

// Import modules
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import models
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');

// Import middleware
const auth = require('../middleware/auth');

// @route   POST api/comments
// @desc    Create a comment
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty(),
            check('post', 'Post is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        // Check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        // Create a new comment
        try {
            const newComment = new Comment({
                text: req.body.text,
                user: req.user.id,
                post: req.body.post,
            });

            // Save the comment
            const comment = await newComment.save();

            // Update the post
            await Post.findByIdAndUpdate(
                req.body.post,
                {
                    $push: { comments: comment._id },
                },
                { new: true }
            );

            // Return the comment
            res.json(comment);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

