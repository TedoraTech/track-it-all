import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Paper,
  Badge,
  Chip,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  ArrowBack,
  Add,
  ExitToApp,
  Info,
  AttachFile,
  EmojiEmotions,
  Menu as MenuIcon,
  School,
  GroupAdd,
  Close,
  Clear,
} from '@mui/icons-material';

// Dummy data for chat groups and messages
const dummyGroups = [
  {
    id: 1,
    name: 'Stanford CS Students',
    university: 'Stanford University',
    category: 'Academic',
    semester: 'Fall',
    year: '2024',
    lastMessage: 'Hey everyone! Anyone know about the new ML course requirements?',
    lastMessageTime: '2:34 PM',
    unreadCount: 3,
    avatar: 'SCS',
    isActive: true,
    memberCount: 247,
    description: 'Computer Science students at Stanford University',
    isJoined: true,
  },
  {
    id: 2,
    name: 'UCLA Engineering',
    university: 'UCLA',
    category: 'Academic',
    semester: 'Fall',
    year: '2024',
    lastMessage: 'Thanks for sharing the internship opportunity!',
    lastMessageTime: '1:45 PM',
    unreadCount: 0,
    avatar: 'UE',
    isActive: false,
    memberCount: 189,
    description: 'Engineering students and alumni from UCLA',
    isJoined: true,
  },
  {
    id: 3,
    name: 'MIT International Students',
    university: 'MIT',
    category: 'Visa',
    semester: 'Spring',
    year: '2024',
    lastMessage: 'Does anyone have experience with H-1B applications?',
    lastMessageTime: '11:22 AM',
    unreadCount: 7,
    avatar: 'MIS',
    isActive: true,
    memberCount: 156,
    description: 'International students at MIT',
    isJoined: true,
  },
  {
    id: 4,
    name: 'Carnegie Mellon Tech Hub',
    university: 'Carnegie Mellon University',
    category: 'Jobs',
    semester: 'Fall',
    year: '2024',
    lastMessage: 'Great job on the hackathon everyone!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    avatar: 'CMTH',
    isActive: false,
    memberCount: 203,
    description: 'Tech enthusiasts at Carnegie Mellon',
    isJoined: true,
  },
  {
    id: 5,
    name: 'UC Berkeley Data Science',
    university: 'UC Berkeley',
    category: 'Academic',
    semester: 'Fall',
    year: '2024',
    lastMessage: 'Study group meeting tomorrow at 7 PM',
    lastMessageTime: 'Yesterday',
    unreadCount: 1,
    avatar: 'UBDS',
    isActive: true,
    memberCount: 134,
    description: 'Data Science students and researchers',
    isJoined: true,
  },
];

// All available groups (including ones user hasn't joined)
const allAvailableGroups = [
  ...dummyGroups,
  {
    id: 6,
    name: 'Stanford ML Research',
    university: 'Stanford University',
    category: 'Academic',
    semester: 'Fall',
    year: '2024',
    avatar: 'SMR',
    isActive: true,
    memberCount: 89,
    description: 'Machine Learning research discussions',
    isJoined: false,
  },
  {
    id: 7,
    name: 'UCLA Housing Help',
    university: 'UCLA',
    category: 'Housing',
    semester: 'Fall',
    year: '2025',
    avatar: 'UHH',
    isActive: true,
    memberCount: 156,
    description: 'Housing recommendations and roommate finder',
    isJoined: false,
  },
  {
    id: 8,
    name: 'MIT Job Search',
    university: 'MIT',
    category: 'Jobs',
    semester: 'Spring',
    year: '2024',
    avatar: 'MJS',
    isActive: true,
    memberCount: 198,
    description: 'Job opportunities and career advice',
    isJoined: false,
  },
  {
    id: 9,
    name: 'Berkeley Entrepreneurs',
    university: 'UC Berkeley',
    category: 'Jobs',
    semester: 'Fall',
    year: '2024',
    avatar: 'BE',
    isActive: true,
    memberCount: 87,
    description: 'Startup and entrepreneurship discussions',
    isJoined: false,
  },
  {
    id: 10,
    name: 'Harvard International',
    university: 'Harvard University',
    category: 'Visa',
    semester: 'Fall',
    year: '2024',
    avatar: 'HI',
    isActive: true,
    memberCount: 145,
    description: 'International student support and visa guidance',
    isJoined: false,
  },
  {
    id: 11,
    name: 'Stanford Social Club',
    university: 'Stanford University',
    category: 'Social',
    semester: 'Fall',
    year: '2024',
    avatar: 'SSC',
    isActive: true,
    memberCount: 234,
    description: 'Social events and meetups',
    isJoined: false,
  },
  {
    id: 12,
    name: 'MIT Housing Exchange',
    university: 'MIT',
    category: 'Housing',
    semester: 'Spring',
    year: '2025',
    avatar: 'MHE',
    isActive: true,
    memberCount: 112,
    description: 'Housing swaps and subletting',
    isJoined: false,
  },
];

const dummyMessages = {
  1: [
    {
      id: 1,
      sender: {
        name: 'Alex Chen',
        avatar: 'AC',
        isCurrentUser: false,
      },
      content: 'Hey everyone! Anyone know about the new ML course requirements?',
      timestamp: '2:34 PM',
      date: 'Today',
      type: 'text',
    },
    {
      id: 2,
      sender: {
        name: 'You',
        avatar: 'YU',
        isCurrentUser: true,
      },
      content: 'I heard they added some prerequisites. Let me check the course catalog.',
      timestamp: '2:36 PM',
      date: 'Today',
      type: 'text',
    },
    {
      id: 3,
      sender: {
        name: 'Sarah Kim',
        avatar: 'SK',
        isCurrentUser: false,
      },
      content: 'Yes! They now require CS229 or equivalent ML background. Also need linear algebra.',
      timestamp: '2:38 PM',
      date: 'Today',
      type: 'text',
    },
    {
      id: 4,
      sender: {
        name: 'Mike Johnson',
        avatar: 'MJ',
        isCurrentUser: false,
      },
      content: 'Thanks Sarah! That helps a lot. Are you planning to take it this semester?',
      timestamp: '2:40 PM',
      date: 'Today',
      type: 'text',
    },
    {
      id: 5,
      sender: {
        name: 'You',
        avatar: 'YU',
        isCurrentUser: true,
      },
      content: 'I am! Maybe we can form a study group for the assignments.',
      timestamp: '2:42 PM',
      date: 'Today',
      type: 'text',
    },
    {
      id: 6,
      sender: {
        name: 'Alex Chen',
        avatar: 'AC',
        isCurrentUser: false,
      },
      content: 'Count me in! We should definitely collaborate on the projects.',
      timestamp: '2:44 PM',
      date: 'Today',
      type: 'text',
    },
  ],
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedGroup, setSelectedGroup] = useState(groupId ? parseInt(groupId) : dummyGroups[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(dummyMessages);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Join Groups Modal states
  const [joinGroupsModalOpen, setJoinGroupsModalOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedGroup]);

  const filteredGroups = dummyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentGroup = dummyGroups.find(group => group.id === selectedGroup);
  const currentMessages = messages[selectedGroup] || [];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: {
        name: 'You',
        avatar: 'YU',
        isCurrentUser: true,
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      type: 'text',
    };

    setMessages(prev => ({
      ...prev,
      [selectedGroup]: [...(prev[selectedGroup] || []), newMsg],
    }));
    
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleLeaveGroup = () => {
    console.log('Leaving group:', selectedGroup);
    setAnchorEl(null);
    // TODO: Implement leave group logic
  };

  const handleMenuClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 150, // Offset to position menu properly
    });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatTime = (timestamp) => {
    return timestamp;
  };

  const isConsecutiveMessage = (currentMsg, prevMsg) => {
    return prevMsg && 
           currentMsg.sender.name === prevMsg.sender.name && 
           currentMsg.date === prevMsg.date;
  };

  // Join Groups Modal handlers
  const handleJoinGroup = (groupId) => {
    console.log('Joining group:', groupId);
    // TODO: Implement join group logic
    setJoinGroupsModalOpen(false);
  };

  const clearGroupFilters = () => {
    setGroupSearchQuery('');
    setSelectedUniversity('');
    setSelectedCategory('');
    setSelectedSemester('');
    setSelectedYear('');
  };

  // Filter available groups
  const universities = [...new Set(allAvailableGroups.map(group => group.university))];
  const categories = [...new Set(allAvailableGroups.map(group => group.category))];
  const semesters = [...new Set(allAvailableGroups.map(group => group.semester))];
  const years = [...new Set(allAvailableGroups.map(group => group.year))];

  const filteredAvailableGroups = allAvailableGroups.filter(group => {
    // Don't show groups the user has already joined
    if (group.isJoined) return false;
    
    const matchesSearch = group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
                         group.university.toLowerCase().includes(groupSearchQuery.toLowerCase());
    
    const matchesUniversity = !selectedUniversity || group.university === selectedUniversity;
    const matchesCategory = !selectedCategory || group.category === selectedCategory;
    const matchesSemester = !selectedSemester || group.semester === selectedSemester;
    const matchesYear = !selectedYear || group.year === selectedYear;

    return matchesSearch && matchesUniversity && matchesCategory && matchesSemester && matchesYear;
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Academic': 'primary',
      'Visa': 'secondary',
      'Housing': 'success',
      'Jobs': 'warning',
      'Social': 'info',
    };
    return colors[category] || 'default';
  };

  // Sidebar component
  const GroupsList = () => (
    <Box sx={{ 
      width: { xs: '100%', md: 350 }, 
      height: '100%', 
      backgroundColor: 'white',
      borderRight: { md: 1 },
      borderColor: { md: 'divider' },
    }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => navigate('/community')}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              Chats
            </Typography>
          </Stack>
          <IconButton onClick={() => setJoinGroupsModalOpen(true)}>
            <Add />
          </IconButton>
        </Stack>
        
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'grey.50',
            },
          }}
        />
      </Box>

      {/* Groups List */}
      <List sx={{ p: 0, overflow: 'auto', height: 'calc(100% - 140px)' }}>
        {filteredGroups.map((group) => (
          <ListItemButton
            key={group.id}
            selected={selectedGroup === group.id}
            onClick={() => handleGroupSelect(group.id)}
            sx={{
              py: 2,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.50',
                borderRight: 3,
                borderColor: 'primary.main',
              },
            }}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={group.unreadCount}
                color="primary"
                invisible={group.unreadCount === 0}
              >
                <Avatar
                  sx={{
                    bgcolor: group.isActive ? 'success.main' : 'grey.400',
                    width: 35,
                    height: 35,
                    fontSize: '0.66rem',
                  }}
                >
                  {group.avatar}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {group.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.lastMessageTime}
                  </Typography>
                </Stack>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {group.lastMessage}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      label={group.university}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 18 }}
                    />
                    <Chip
                      label={`${group.memberCount} members`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 18 }}
                    />
                  </Stack>
                </Box>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  // Chat area component
  const ChatArea = () => (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: 'grey.50',
    }}>
      {/* Chat Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Avatar
              sx={{
                bgcolor: currentGroup?.isActive ? 'success.main' : 'grey.400',
                width: 40,
                height: 40,
                fontSize: '0.75rem',
              }}
            >
              {currentGroup?.avatar}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {currentGroup?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentGroup?.memberCount} members • {currentGroup?.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={handleMenuClick}
            >
              <MoreVert />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {currentMessages.map((message, index) => {
          const prevMessage = currentMessages[index - 1];
          const isConsecutive = isConsecutiveMessage(message, prevMessage);
          
          return (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender.isCurrentUser ? 'flex-end' : 'flex-start',
                mb: isConsecutive ? 0.5 : 2,
              }}
            >
              <Stack
                direction={message.sender.isCurrentUser ? 'row-reverse' : 'row'}
                spacing={1}
                alignItems="flex-end"
                sx={{ maxWidth: '70%' }}
              >
                {!isConsecutive && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: message.sender.isCurrentUser ? 'primary.main' : 'secondary.main',
                      visibility: message.sender.isCurrentUser ? 'hidden' : 'visible',
                      fontSize: '0.7rem',
                    }}
                  >
                    {message.sender.avatar}
                  </Avatar>
                )}
                
                <Box
                  sx={{
                    ml: isConsecutive && !message.sender.isCurrentUser ? 5 : 0,
                    mr: isConsecutive && message.sender.isCurrentUser ? 5 : 0,
                  }}
                >
                  {!isConsecutive && !message.sender.isCurrentUser && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, mb: 0.5, display: 'block' }}
                    >
                      {message.sender.name}
                    </Typography>
                  )}
                  
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      backgroundColor: message.sender.isCurrentUser ? 'primary.main' : 'white',
                      color: message.sender.isCurrentUser ? 'white' : 'text.primary',
                      borderRadius: 2,
                      borderTopLeftRadius: message.sender.isCurrentUser ? 10 : (isConsecutive ? 0.5 : 2),
                      borderTopRightRadius: message.sender.isCurrentUser ? (isConsecutive ? 0.5 : 2) : 10,
                      borderBottomLeftRadius: message.sender.isCurrentUser ? 10 : 10,
                      borderBottomRightRadius: message.sender.isCurrentUser ? 10 : 10,
                    }}
                  >
                    <Typography variant="body2">
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.8,
                        fontSize: '0.7rem',
                        textAlign: message.sender.isCurrentUser ? 'right' : 'left',
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 0,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <IconButton>
            <AttachFile />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'white',
              },
            }}
          />
          
          <IconButton>
            <EmojiEmotions />
          </IconButton>
          
          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            <Send />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Mobile Header */}
      {isMobile && (
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/community')}
            >
              <ArrowBack />
            </IconButton>
            <School sx={{ mx: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Student Hub Chats
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}>
        {/* Desktop Sidebar */}
        {!isMobile && <GroupsList />}
        
        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: '100%',
              maxWidth: 350,
            },
          }}
        >
          <GroupsList />
        </Drawer>

        {/* Chat Area */}
        <ChatArea />

        {/* Group Options Menu */}
        <Menu
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            anchorEl ? { top: menuPosition.top, left: menuPosition.left } : undefined
          }
        >
          <MenuItem onClick={() => setGroupInfoOpen(true)}>
            <Info sx={{ mr: 1 }} />
            Group Info
          </MenuItem>
          <MenuItem onClick={handleLeaveGroup}>
            <ExitToApp sx={{ mr: 1 }} />
            Leave Group
          </MenuItem>
        </Menu>

        {/* Group Info Dialog */}
        <Dialog
          open={groupInfoOpen}
          onClose={() => setGroupInfoOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontSize: '0.8rem' }}>
                {currentGroup?.avatar}
              </Avatar>
              <Box>
                <Typography variant="h6">{currentGroup?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentGroup?.memberCount} members
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              {currentGroup?.description}
            </Typography>
            <Chip
              label={currentGroup?.university}
              color="primary"
              sx={{ mr: 1 }}
            />
            <Chip
              label={currentGroup?.isActive ? 'Active' : 'Inactive'}
              color={currentGroup?.isActive ? 'success' : 'default'}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGroupInfoOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Join Groups Modal */}
        <Dialog
          open={joinGroupsModalOpen}
          onClose={() => setJoinGroupsModalOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Join Groups
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discover and join groups that match your interests
                </Typography>
              </Box>
              <IconButton
                onClick={() => setJoinGroupsModalOpen(false)}
                size="small"
              >
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            {/* Search and Filters */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Stack spacing={3}>
                {/* Search Bar */}
                <TextField
                  fullWidth
                  placeholder="Search groups by name, description, or university..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Filters */}
                <Grid container spacing={2}>
                  <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3 }}>
                    <FormControl fullWidth size="small">
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
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3 }}>
                    <FormControl fullWidth size="small">
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
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3 }}>
                    <FormControl fullWidth size="small">
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
                  </Grid>

                  <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3 }}>
                    <FormControl fullWidth size="small">
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
                  </Grid>
                </Grid>

                {/* Clear Filters Button */}
                {(groupSearchQuery || selectedUniversity || selectedCategory || selectedSemester || selectedYear) && (
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={clearGroupFilters}
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Groups List */}
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredAvailableGroups.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No groups found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria or filters.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {filteredAvailableGroups.map((group) => (
                    <ListItemButton
                      key={group.id}
                      sx={{
                        py: 2,
                        px: 3,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 0 },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: group.isActive ? 'success.main' : 'grey.400',
                            width: 40,
                            height: 40,
                            fontSize: '0.7rem',
                          }}
                        >
                          {group.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {group.name}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<GroupAdd />}
                              onClick={() => handleJoinGroup(group.id)}
                              disabled={!group.isActive}
                            >
                              Join
                            </Button>
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {group.description}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                              <Chip
                                label={group.university}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                              <Chip
                                label={group.category}
                                size="small"
                                color={getCategoryColor(group.category)}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                              <Chip
                                label={`${group.semester} ${group.year}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
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
                            </Stack>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {filteredAvailableGroups.length} groups found
            </Typography>
            <Button
              onClick={() => setJoinGroupsModalOpen(false)}
              variant="outlined"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ChatPage;
