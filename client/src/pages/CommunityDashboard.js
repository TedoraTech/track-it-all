import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Divider,
  Badge,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Comment,
  School,
  FilterList,
  Search,
  Add,
  TrendingUp,
  Group,
  Visibility,
  Close,
  Clear,
  Message,
  GroupAdd,
  Analytics,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Dummy data for posts
const dummyPosts = [
  {
    id: 1,
    title: 'F-1 to H-1B Transition Experience at Google',
    content: 'Just wanted to share my experience transitioning from F-1 to H-1B. Applied in April, got selected in the lottery, and received approval last month. Happy to answer any questions!',
    author: {
      name: 'Sarah Chen',
      avatar: 'SC',
      university: 'Stanford University',
    },
    category: 'Visa',
    university: 'Stanford University',
    semester: 'Fall',
    year: '2024',
    upvotes: 45,
    downvotes: 2,
    replies: 12,
    timeAgo: '2 hours ago',
    tags: ['H1B', 'F1', 'Google', 'Tech'],
  },
  {
    id: 2,
    title: 'Best Housing Options Near UCLA?',
    content: 'Starting my MS in Computer Science at UCLA this fall. Looking for housing recommendations within 30 minutes of campus. Budget is around $1500/month. Any suggestions?',
    author: {
      name: 'Mike Johnson',
      avatar: 'MJ',
      university: 'UCLA',
    },
    category: 'Housing',
    university: 'UCLA',
    semester: 'Fall',
    year: '2025',
    upvotes: 23,
    downvotes: 0,
    replies: 8,
    timeAgo: '4 hours ago',
    tags: ['Housing', 'UCLA', 'Apartment'],
  },
  {
    id: 3,
    title: 'CPT Application Timeline and Tips',
    content: 'For those planning to apply for CPT, here\'s my timeline: Started process 90 days before, got approval in 3 weeks. Make sure to have your I-20 updated and maintain good academic standing.',
    author: {
      name: 'Priya Patel',
      avatar: 'PP',
      university: 'Carnegie Mellon University',
    },
    category: 'Academic',
    university: 'Carnegie Mellon University',
    semester: 'Spring',
    year: '2024',
    upvotes: 67,
    downvotes: 1,
    replies: 15,
    timeAgo: '6 hours ago',
    tags: ['CPT', 'Internship', 'Timeline'],
  },
  {
    id: 4,
    title: 'Study Group for Machine Learning Course',
    content: 'Looking to form a study group for CS229 (Machine Learning) at Stanford. We can meet weekly to discuss assignments and prepare for exams. DM me if interested!',
    author: {
      name: 'David Kim',
      avatar: 'DK',
      university: 'Stanford University',
    },
    category: 'Academic',
    university: 'Stanford University',
    semester: 'Fall',
    year: '2024',
    upvotes: 18,
    downvotes: 0,
    replies: 6,
    timeAgo: '8 hours ago',
    tags: ['Study Group', 'ML', 'CS229'],
  },
  {
    id: 5,
    title: 'OPT Extension Approved - STEM Field',
    content: 'Great news! My OPT extension for STEM field got approved. Applied 3 months before expiry, got approval in 2 months. Working in software engineering. Happy to share experience!',
    author: {
      name: 'Alex Rodriguez',
      avatar: 'AR',
      university: 'MIT',
    },
    category: 'Visa',
    university: 'MIT',
    semester: 'Spring',
    year: '2024',
    upvotes: 89,
    downvotes: 0,
    replies: 22,
    timeAgo: '1 day ago',
    tags: ['OPT', 'STEM', 'Extension'],
  },
  {
    id: 6,
    title: 'Networking Event at Tech Companies',
    content: 'Microsoft is hosting a networking event for international students next Friday. Great opportunity to connect with engineers and learn about internship opportunities. Register on their careers page!',
    author: {
      name: 'Emily Zhang',
      avatar: 'EZ',
      university: 'UC Berkeley',
    },
    category: 'Jobs',
    university: 'UC Berkeley',
    semester: 'Fall',
    year: '2024',
    upvotes: 34,
    downvotes: 1,
    replies: 9,
    timeAgo: '1 day ago',
    tags: ['Networking', 'Microsoft', 'Jobs'],
  },
];

// Dummy data for university chat groups
const universityGroups = {
  'Stanford University': [
    {
      id: 1,
      name: 'Stanford CS Students',
      description: 'Computer Science students at Stanford University',
      memberCount: 247,
      isActive: true,
      isMember: true,
      avatar: 'SCS',
    },
    {
      id: 4,
      name: 'Stanford ML Research',
      description: 'Machine Learning research discussions',
      memberCount: 89,
      isActive: true,
      isMember: false,
      avatar: 'SMR',
    },
    {
      id: 7,
      name: 'Stanford International',
      description: 'International students support group',
      memberCount: 156,
      isActive: true,
      isMember: false,
      avatar: 'SI',
    },
  ],
  'UCLA': [
    {
      id: 2,
      name: 'UCLA Engineering',
      description: 'Engineering students and alumni from UCLA',
      memberCount: 189,
      isActive: false,
      isMember: false,
      avatar: 'UE',
    },
    {
      id: 8,
      name: 'UCLA Tech Hub',
      description: 'Technology discussions and opportunities',
      memberCount: 134,
      isActive: true,
      isMember: true,
      avatar: 'UTH',
    },
  ],
  'MIT': [
    {
      id: 5,
      name: 'MIT International Students',
      description: 'International students at MIT',
      memberCount: 156,
      isActive: true,
      isMember: false,
      avatar: 'MIS',
    },
    {
      id: 9,
      name: 'MIT AI & Robotics',
      description: 'AI and Robotics enthusiasts',
      memberCount: 98,
      isActive: true,
      isMember: true,
      avatar: 'MAR',
    },
  ],
  'Carnegie Mellon University': [
    {
      id: 4,
      name: 'Carnegie Mellon Tech Hub',
      description: 'Tech enthusiasts at Carnegie Mellon',
      memberCount: 203,
      isActive: false,
      isMember: false,
      avatar: 'CMTH',
    },
    {
      id: 10,
      name: 'CMU International',
      description: 'International student community',
      memberCount: 145,
      isActive: true,
      isMember: false,
      avatar: 'CI',
    },
  ],
  'UC Berkeley': [
    {
      id: 6,
      name: 'UC Berkeley Data Science',
      description: 'Data Science students and researchers',
      memberCount: 134,
      isActive: true,
      isMember: true,
      avatar: 'UBDS',
    },
    {
      id: 11,
      name: 'Berkeley Entrepreneurs',
      description: 'Startup and entrepreneurship discussions',
      memberCount: 87,
      isActive: true,
      isMember: false,
      avatar: 'BE',
    },
  ],
};

const CommunityDashboard = () => {
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [chatGroupsModalOpen, setChatGroupsModalOpen] = useState(false);
  const [selectedUniversityForChat, setSelectedUniversityForChat] = useState('');

  // Get unique values for filters
  const universities = [...new Set(dummyPosts.map(post => post.university))];
  const categories = [...new Set(dummyPosts.map(post => post.category))];
  const semesters = [...new Set(dummyPosts.map(post => post.semester))];
  const years = [...new Set(dummyPosts.map(post => post.year))];

  // Filter posts based on search and filters
  const filteredPosts = dummyPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUniversity = !selectedUniversity || post.university === selectedUniversity;
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesSemester = !selectedSemester || post.semester === selectedSemester;
    const matchesYear = !selectedYear || post.year === selectedYear;

    return matchesSearch && matchesUniversity && matchesCategory && matchesSemester && matchesYear;
  });

  const handleUpvote = (postId) => {
    console.log('Upvoted post:', postId);
    // TODO: Implement upvote logic
  };

  const handleDownvote = (postId) => {
    console.log('Downvoted post:', postId);
    // TODO: Implement downvote logic
  };

  const handleViewThread = (postId) => {
    console.log('View thread for post:', postId);
    navigate(`/post/${postId}`);
  };

  const handleOpenChat = (university) => {
    console.log('Open chat for university:', university);
    setSelectedUniversityForChat(university);
    setChatGroupsModalOpen(true);
  };

  const handleJoinGroup = (groupId, groupName) => {
    console.log('Joining group:', groupId, groupName);
    // TODO: Implement join group logic
    setChatGroupsModalOpen(false);
    navigate('/chats');
  };

  const handleViewGroup = (groupId) => {
    console.log('Viewing group:', groupId);
    setChatGroupsModalOpen(false);
    navigate(`/chats/${groupId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedUniversity('');
    setSelectedCategory('');
    setSelectedSemester('');
    setSelectedYear('');
  };

  const getActiveFilters = () => {
    const filters = [];
    if (selectedUniversity) filters.push({ type: 'university', value: selectedUniversity, label: `University: ${selectedUniversity}` });
    if (selectedCategory) filters.push({ type: 'category', value: selectedCategory, label: `Category: ${selectedCategory}` });
    if (selectedSemester) filters.push({ type: 'semester', value: selectedSemester, label: `Semester: ${selectedSemester}` });
    if (selectedYear) filters.push({ type: 'year', value: selectedYear, label: `Year: ${selectedYear}` });
    return filters;
  };

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'university':
        setSelectedUniversity('');
        break;
      case 'category':
        setSelectedCategory('');
        break;
      case 'semester':
        setSelectedSemester('');
        break;
      case 'year':
        setSelectedYear('');
        break;
      default:
        break;
    }
  };

  const activeFilters = getActiveFilters();

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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
          color: 'white',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <School sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Student Hub Community
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Connect, Share, and Learn Together
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                onClick={() => navigate('/analytics')}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    borderColor: 'grey.100',
                  },
                }}
              >
                Analytics
              </Button>
              <Button
                variant="outlined"
                startIcon={<Message />}
                onClick={() => navigate('/chats')}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    borderColor: 'grey.100',
                  },
                }}
              >
                Chats
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
                onClick={() => navigate('/create-post')}
              >
                New Post
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search Bar and Filters Section */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            {/* Extended Search Bar */}
            <TextField
              fullWidth
              placeholder="Search posts, authors, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                },
              }}
            />
            
            {/* Filter Button */}
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                minWidth: 120,
                height: 56,
                borderRadius: 2,
                backgroundColor: 'white',
              }}
            >
              Filters
              {activeFilters.length > 0 && (
                <Badge
                  badgeContent={activeFilters.length}
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
          </Stack>

          {/* Active Filters as Chips */}
          {activeFilters.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Active filters:
                </Typography>
                {activeFilters.map((filter) => (
                  <Chip
                    key={filter.type}
                    label={filter.label}
                    onDelete={() => removeFilter(filter.type)}
                    deleteIcon={<Close />}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
                <Button
                  size="small"
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  sx={{ ml: 1 }}
                >
                  Clear All
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Posts Content */}
        <Stack spacing={3}>
          {/* Results Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {filteredPosts.length} Posts Found
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<TrendingUp />}
                label="Trending"
                variant="outlined"
                color="primary"
              />
              <Chip
                icon={<Group />}
                label="Popular"
                variant="outlined"
              />
            </Stack>
          </Stack>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No posts found matching your filters
              </Typography>
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Paper>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post.id}
                sx={{
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ pb: 2 }}>
                  {/* Post Header */}
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {post.author.avatar}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {post.author.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.author.university} • {post.timeAgo}
                      </Typography>
                    </Box>
                    <Chip
                      label={post.category}
                      color={getCategoryColor(post.category)}
                      size="small"
                    />
                  </Stack>

                  {/* Post Content */}
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleViewThread(post.id)}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {post.content}
                  </Typography>

                  {/* Tags */}
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {post.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>

                  {/* Post Meta */}
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    <Typography variant="caption">
                      {post.university}
                    </Typography>
                    <Typography variant="caption">
                      {post.semester} {post.year}
                    </Typography>
                  </Stack>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ width: '100%' }}
                  >
                    {/* Upvote */}
                    <Button
                      size="small"
                      startIcon={<ThumbUp />}
                      onClick={() => handleUpvote(post.id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      {post.upvotes}
                    </Button>

                    {/* Downvote */}
                    <Button
                      size="small"
                      startIcon={<ThumbDown />}
                      onClick={() => handleDownvote(post.id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      {post.downvotes}
                    </Button>

                    {/* Comments */}
                    <Button
                      size="small"
                      startIcon={<Comment />}
                      onClick={() => handleViewThread(post.id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      {post.replies}
                    </Button>

                    {/* Message/Chat */}
                    <Button
                      size="small"
                      startIcon={<Message />}
                      onClick={() => handleOpenChat(post.university)}
                      sx={{ minWidth: 'auto' }}
                    >
                      Chat
                    </Button>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* View Thread */}
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewThread(post.id)}
                      variant="outlined"
                    >
                      View Thread
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            ))
          )}
        </Stack>

        {/* Filter Drawer */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 350,
              p: 3,
            },
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">
                Filter Posts
              </Typography>
              <IconButton
                onClick={() => setFilterDrawerOpen(false)}
                size="small"
              >
                <Close />
              </IconButton>
            </Stack>

            <Divider />

            {/* University Filter */}
            <FormControl fullWidth>
              <InputLabel>University</InputLabel>
              <Select
                value={selectedUniversity}
                label="University"
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <MenuItem value="">All Universities</MenuItem>
                {universities.map((uni) => (
                  <MenuItem key={uni} value={uni}>
                    {uni}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Category Filter */}
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Semester Filter */}
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                label="Semester"
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <MenuItem value="">All Semesters</MenuItem>
                {semesters.map((semester) => (
                  <MenuItem key={semester} value={semester}>
                    {semester}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year Filter */}
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <MenuItem value="">All Years</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            {/* Filter Actions */}
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setFilterDrawerOpen(false)}
              >
                Apply Filters
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </Stack>
          </Stack>
        </Drawer>

        {/* Chat Groups Modal */}
        <Dialog
          open={chatGroupsModalOpen}
          onClose={() => setChatGroupsModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <School color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedUniversityForChat} Groups
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Join or view chat groups for this university
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                onClick={() => setChatGroupsModalOpen(false)}
                size="small"
              >
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            <List>
              {(universityGroups[selectedUniversityForChat] || []).map((group) => (
                <ListItem
                  key={group.id}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: group.isActive ? 'success.main' : 'grey.400',
                        fontSize: '0.8rem',
                      }}
                    >
                      {group.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {group.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {group.description}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`${group.memberCount} members`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          <Chip
                            label={group.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={group.isActive ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          {group.isMember && (
                            <Chip
                              label="Member"
                              size="small"
                              color="primary"
                              variant="filled"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Stack>
                      </Box>
                    }
                  />
                  <Box sx={{ ml: 2 }}>
                    {group.isMember ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Message />}
                        onClick={() => handleViewGroup(group.id)}
                        sx={{ minWidth: 80 }}
                      >
                        View
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<GroupAdd />}
                        onClick={() => handleJoinGroup(group.id, group.name)}
                        disabled={!group.isActive}
                        sx={{ minWidth: 80 }}
                      >
                        Join
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
            
            {(!universityGroups[selectedUniversityForChat] || universityGroups[selectedUniversityForChat].length === 0) && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No groups found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are no chat groups available for {selectedUniversityForChat} yet.
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setChatGroupsModalOpen(false);
                navigate('/chats');
              }}
              variant="text"
            >
              Browse All Groups
            </Button>
            <Button
              onClick={() => setChatGroupsModalOpen(false)}
              variant="outlined"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CommunityDashboard;
