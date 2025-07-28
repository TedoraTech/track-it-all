import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Divider,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  School,
  Add,
  Delete,
  AttachFile,
  Image,
  VideoFile,
  PictureAsPdf,
  Description,
  Send,
  Save,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components for file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FileUploadBox = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&.dragover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const CreatePost = () => {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [university, setUniversity] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options for dropdowns
  const categories = ['Visa', 'Housing', 'Academic', 'Jobs', 'Social', 'General'];
  const universities = [
    'Stanford University',
    'UCLA',
    'MIT',
    'Carnegie Mellon University',
    'UC Berkeley',
    'Harvard University',
    'University of Washington',
    'Georgia Tech',
    'University of Texas at Austin',
    'Other',
  ];
  const semesters = ['Fall', 'Spring', 'Summer'];
  const years = ['2024', '2025', '2026'];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
    }));
    setFiles([...files, ...newFiles]);
  };

  const handleFileRemove = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    const newFiles = droppedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
    }));
    setFiles([...files, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image color="primary" />;
    if (fileType.startsWith('video/')) return <VideoFile color="primary" />;
    if (fileType === 'application/pdf') return <PictureAsPdf color="error" />;
    return <Description color="action" />;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category || !university) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate file upload progress
    if (files.length > 0) {
      const updatedFiles = [...files];
      for (let i = 0; i < updatedFiles.length; i++) {
        for (let progress = 0; progress <= 100; progress += 10) {
          updatedFiles[i].progress = progress;
          setFiles([...updatedFiles]);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Post created:', {
      title,
      content,
      category,
      university,
      semester,
      year,
      tags,
      files: files.map(f => f.name),
    });

    setIsSubmitting(false);
    navigate('/community');
  };

  const handleSaveDraft = () => {
    console.log('Draft saved');
    // TODO: Implement draft saving logic
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
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => navigate('/community')}
              sx={{ color: 'white' }}
            >
              <ArrowBack />
            </IconButton>
            <School sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Create New Post
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Share your experience with the community
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Basic Information
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your post"
                    required
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={category}
                        label="Category"
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                      <InputLabel>University</InputLabel>
                      <Select
                        value={university}
                        label="University"
                        onChange={(e) => setUniversity(e.target.value)}
                      >
                        {universities.map((uni) => (
                          <MenuItem key={uni} value={uni}>
                            {uni}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Semester</InputLabel>
                      <Select
                        value={semester}
                        label="Semester"
                        onChange={(e) => setSemester(e.target.value)}
                      >
                        {semesters.map((sem) => (
                          <MenuItem key={sem} value={sem}>
                            {sem}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Year</InputLabel>
                      <Select
                        value={year}
                        label="Year"
                        onChange={(e) => setYear(e.target.value)}
                      >
                        {years.map((yr) => (
                          <MenuItem key={yr} value={yr}>
                            {yr}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Content Editor */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Post Content
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  label="Write your post content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience, ask questions, or provide helpful information to the community..."
                  required
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '1rem',
                      lineHeight: 1.6,
                    },
                  }}
                />
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  You can use basic formatting like **bold**, *italic*, and line breaks
                </Typography>
              </Box>

              <Divider />

              {/* Tags */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Tags
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <TextField
                    size="small"
                    label="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    sx={{ minWidth: 150 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddTag}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Stack>

                {tags.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                    {tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* File Upload */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Attachments
                </Typography>
                
                <FileUploadBox
                  className={isDragOver ? 'dragover' : ''}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <Stack spacing={2} alignItems="center">
                    <AttachFile sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Box textAlign="center">
                      <Typography variant="h6" gutterBottom>
                        Drop files here or click to upload
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supports images, videos, PDFs, and documents (Max 10MB per file)
                      </Typography>
                    </Box>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AttachFile />}
                    >
                      Choose Files
                      <VisuallyHiddenInput
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      />
                    </Button>
                  </Stack>
                </FileUploadBox>

                {/* File List */}
                {files.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded Files ({files.length})
                    </Typography>
                    <Stack spacing={1}>
                      {files.map((file) => (
                        <Paper
                          key={file.id}
                          sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {getFileIcon(file.type)}
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight="bold">
                                {file.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.size)}
                              </Typography>
                              {file.progress > 0 && file.progress < 100 && (
                                <LinearProgress
                                  variant="determinate"
                                  value={file.progress}
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleFileRemove(file.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Actions */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
              >
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  Save Draft
                </Button>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/community')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim() || !content.trim() || !category || !university}
                    size="large"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Post'}
                  </Button>
                </Stack>
              </Stack>

              {isSubmitting && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Publishing your post... Please wait.
                  </Typography>
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CreatePost;
