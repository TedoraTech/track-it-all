import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Avatar,
  Chip,
  TextField,
  IconButton,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Reply,
  Share,
  Bookmark,
  BookmarkBorder,
  ArrowBack,
  Send,
  Flag,
  School,
  AccessTime,
  Visibility,
} from '@mui/icons-material';

// Dummy data for the main post and replies
const getPostData = (postId) => {
  const posts = {
    1: {
      id: 1,
      title: 'F-1 to H-1B Transition Experience at Google',
      content: `Just wanted to share my experience transitioning from F-1 to H-1B. Applied in April, got selected in the lottery, and received approval last month. Happy to answer any questions!

Here's my timeline:
- Applied for H-1B in April 2024
- Got selected in the lottery in May
- Submitted all required documents by June
- Received RFE (Request for Evidence) in July
- Responded to RFE in August
- Got approval in September
- Started work in October

Some tips for anyone going through this process:
1. Start preparing documents early
2. Work closely with your employer's immigration lawyer
3. Keep copies of everything
4. Be patient - the process takes time

Feel free to ask any specific questions about the process!`,
      author: {
        name: 'Sarah Chen',
        avatar: 'SC',
        university: 'Stanford University',
        reputation: 2847,
        badges: ['Top Contributor', 'Verified Student'],
      },
      category: 'Visa',
      university: 'Stanford University',
      semester: 'Fall',
      year: '2024',
      upvotes: 45,
      downvotes: 2,
      views: 1234,
      bookmarks: 12,
      timeAgo: '2 hours ago',
      tags: ['H1B', 'F1', 'Google', 'Tech', 'Visa-Transition'],
      isBookmarked: false,
      replies: [
        {
          id: 101,
          content: 'Thanks for sharing this detailed timeline! I\'m currently on F-1 and planning to apply for H-1B next year. Did you face any challenges during the RFE process?',
          author: {
            name: 'Mike Johnson',
            avatar: 'MJ',
            university: 'UCLA',
            reputation: 156,
          },
          upvotes: 8,
          downvotes: 0,
          timeAgo: '1 hour ago',
          isAccepted: false,
        },
        {
          id: 102,
          content: 'Congratulations on your approval! The timeline you shared is really helpful. I\'m curious about the RFE - what kind of additional documents did they ask for?',
          author: {
            name: 'Priya Patel',
            avatar: 'PP',
            university: 'Carnegie Mellon University',
            reputation: 891,
          },
          upvotes: 12,
          downvotes: 0,
          timeAgo: '45 minutes ago',
          isAccepted: true,
        },
        {
          id: 103,
          content: 'This is exactly what I needed to see! I\'m in a similar situation. Did Google\'s legal team handle most of the paperwork, or did you have to do a lot yourself?',
          author: {
            name: 'David Kim',
            avatar: 'DK',
            university: 'MIT',
            reputation: 432,
          },
          upvotes: 5,
          downvotes: 0,
          timeAgo: '30 minutes ago',
          isAccepted: false,
        },
      ],
    },
  };
  
  return posts[postId] || null;
};

const PostThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [sortBy, setSortBy] = useState('votes'); // 'votes', 'newest', 'oldest'

  useEffect(() => {
    const postData = getPostData(parseInt(id));
    setPost(postData);
  }, [id]);

  const handleUpvote = (type, itemId) => {
    console.log(`Upvoted ${type}:`, itemId);
    // TODO: Implement upvote logic
  };

  const handleDownvote = (type, itemId) => {
    console.log(`Downvoted ${type}:`, itemId);
    // TODO: Implement downvote logic
  };

  const handleBookmark = () => {
    console.log('Bookmarked post:', id);
    setPost(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    console.log('Post link copied to clipboard');
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;
    
    setReplyLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newReplyObj = {
        id: Date.now(),
        content: newReply,
        author: {
          name: 'Current User',
          avatar: 'CU',
          university: 'Your University',
          reputation: 45,
        },
        upvotes: 0,
        downvotes: 0,
        timeAgo: 'just now',
        isAccepted: false,
      };
      
      setPost(prev => ({
        ...prev,
        replies: [...prev.replies, newReplyObj],
      }));
      setNewReply('');
      setReplyLoading(false);
    }, 1000);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Visa': 'primary',
      'Housing': 'secondary',
      'Academic': 'success',
      'Jobs': 'warning',
      'Social': 'info',
      'General': 'default',
    };
    return colors[category] || 'default';
  };

  const sortedReplies = post?.replies?.sort((a, b) => {
    if (sortBy === 'votes') return b.upvotes - a.upvotes;
    if (sortBy === 'newest') return new Date(b.timeAgo) - new Date(a.timeAgo);
    if (sortBy === 'oldest') return new Date(a.timeAgo) - new Date(b.timeAgo);
    return 0;
  }) || [];

  if (!post) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Post not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
          color: 'white',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => navigate('/community')}
              sx={{ color: 'white' }}
            >
              <ArrowBack />
            </IconButton>
            <School />
            <Typography variant="h6">
              Student Hub Community
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              navigate('/community');
            }}
            sx={{ cursor: 'pointer' }}
          >
            Community
          </Link>
          <Link
            color="inherit"
            href={`/community?category=${post.category}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/community?category=${post.category}`);
            }}
            sx={{ cursor: 'pointer' }}
          >
            {post.category}
          </Link>
          <Typography color="text.primary">
            {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
          </Typography>
        </Breadcrumbs>

        <Stack spacing={4}>
          {/* Main Question/Post */}
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Post Header */}
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {post.title}
                  </Typography>
                  
                  {/* Post Meta Info */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{ mb: 3 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Asked {post.timeAgo}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {post.views} views
                      </Typography>
                    </Stack>
                    <Chip
                      label={post.category}
                      color={getCategoryColor(post.category)}
                      size="small"
                    />
                  </Stack>
                </Box>

                {/* Post Content */}
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    fontSize: '1.1rem',
                  }}
                >
                  {post.content}
                </Typography>

                {/* Tags */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {post.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => navigate(`/community?tag=${tag}`)}
                    />
                  ))}
                </Stack>

                {/* Author Info */}
                <Box
                  sx={{
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                    p: 2,
                    ml: 'auto',
                    maxWidth: 300,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Asked by
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      {post.author.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {post.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.author.university}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {post.author.reputation} reputation
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                    {post.author.badges?.map((badge, index) => (
                      <Chip
                        key={index}
                        label={badge}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>

            <CardActions sx={{ px: 4, pb: 3, justifyContent: 'space-between' }}>
              {/* Vote and Actions */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  startIcon={<ThumbUp />}
                  onClick={() => handleUpvote('post', post.id)}
                  size="small"
                >
                  {post.upvotes}
                </Button>
                <Button
                  startIcon={<ThumbDown />}
                  onClick={() => handleDownvote('post', post.id)}
                  size="small"
                >
                  {post.downvotes}
                </Button>
                <IconButton onClick={handleBookmark} size="small">
                  {post.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                </IconButton>
                <Button
                  startIcon={<Share />}
                  onClick={handleShare}
                  size="small"
                >
                  Share
                </Button>
              </Stack>

              <Button
                startIcon={<Flag />}
                size="small"
                color="error"
              >
                Report
              </Button>
            </CardActions>
          </Card>

          {/* Replies Section */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h5" fontWeight="bold">
                {post.replies.length} Answer{post.replies.length !== 1 ? 's' : ''}
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant={sortBy === 'votes' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSortBy('votes')}
                >
                  Votes
                </Button>
                <Button
                  variant={sortBy === 'newest' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSortBy('newest')}
                >
                  Newest
                </Button>
                <Button
                  variant={sortBy === 'oldest' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSortBy('oldest')}
                >
                  Oldest
                </Button>
              </Stack>
            </Stack>

            {/* Replies List */}
            <Stack spacing={3}>
              {sortedReplies.map((reply, index) => (
                <Card
                  key={reply.id}
                  sx={{
                    borderRadius: 2,
                    borderLeft: reply.isAccepted ? '4px solid' : 'none',
                    borderLeftColor: reply.isAccepted ? 'success.main' : 'transparent',
                    backgroundColor: reply.isAccepted ? 'success.50' : 'background.paper',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {reply.isAccepted && (
                      <Chip
                        label="✓ Accepted Answer"
                        color="success"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                    
                    <Typography
                      variant="body1"
                      sx={{ lineHeight: 1.7, mb: 3, whiteSpace: 'pre-line' }}
                    >
                      {reply.content}
                    </Typography>

                    {/* Reply Author Info */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {reply.author.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {reply.author.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {reply.author.university} • {reply.timeAgo}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          startIcon={<ThumbUp />}
                          onClick={() => handleUpvote('reply', reply.id)}
                          size="small"
                        >
                          {reply.upvotes}
                        </Button>
                        <Button
                          startIcon={<ThumbDown />}
                          onClick={() => handleDownvote('reply', reply.id)}
                          size="small"
                        >
                          {reply.downvotes}
                        </Button>
                        <IconButton size="small">
                          <Reply />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Add Reply Section */}
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Answer
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Share your knowledge and help the community..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Please be respectful and constructive in your answers
              </Typography>
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handleSubmitReply}
                disabled={!newReply.trim() || replyLoading}
              >
                {replyLoading ? 'Posting...' : 'Post Answer'}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default PostThread;
