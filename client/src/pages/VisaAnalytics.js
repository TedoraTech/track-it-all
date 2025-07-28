import React, { useState } from 'react';
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
  Grid,
  Paper,
  LinearProgress,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  School,
  TrendingUp,
  AccessTime,
  Group,
  CheckCircle,
  Schedule,
  Speed,
  Analytics,
  CalendarToday,
  Assignment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Dummy data for visa statistics
const visaTypes = [
  'F-1 (Student Visa)',
  'H-1B (Work Visa)',
  'OPT (Optional Practical Training)',
  'STEM OPT Extension',
  'CPT (Curricular Practical Training)',
  'J-1 (Exchange Visitor)',
  'L-1 (Intracompany Transfer)',
  'O-1 (Extraordinary Ability)',
];

const processingTimesData = [
  { month: 'Jan', standard: 12, premium: 3, applications: 2150 },
  { month: 'Feb', standard: 14, premium: 4, applications: 1980 },
  { month: 'Mar', standard: 16, premium: 3, applications: 2890 },
  { month: 'Apr', standard: 18, premium: 5, applications: 4200 },
  { month: 'May', standard: 15, premium: 4, applications: 3850 },
  { month: 'Jun', standard: 13, premium: 3, applications: 2750 },
];

const applicationVolumeData = [
  { date: '2024-01', count: 2150, approved: 1890, rejected: 180, pending: 80 },
  { date: '2024-02', count: 1980, approved: 1750, rejected: 150, pending: 80 },
  { date: '2024-03', count: 2890, approved: 2450, rejected: 290, pending: 150 },
  { date: '2024-04', count: 4200, approved: 3580, rejected: 420, pending: 200 },
  { date: '2024-05', count: 3850, approved: 3200, rejected: 385, pending: 265 },
  { date: '2024-06', count: 2750, approved: 2200, rejected: 275, pending: 275 },
];

const statusDistribution = [
  { name: 'Approved', value: 68, color: '#16A34A' },
  { name: 'Pending', value: 22, color: '#F59E0B' },
  { name: 'Rejected', value: 7, color: '#DC2626' },
  { name: 'Under Review', value: 3, color: '#2563EB' },
];

const statusUpdateOptions = [
  'RFE (Request for Evidence) Received',
  'Biometrics Appointment Scheduled',
  'Biometrics Completed',
  'Interview Scheduled',
  'Interview Completed',
  'Case Transferred to Another Office',
  'Decision Notice Sent',
  'Card Being Produced',
  'Card Mailed',
  'Case Approved',
  'Case Denied',
  'Administrative Processing',
  'Additional Documentation Requested',
];

const VisaAnalytics = () => {
  const navigate = useNavigate();

  // Form states
  const [visaType, setVisaType] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [userApplicationData, setUserApplicationData] = useState(null);

  // Status update states
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const handleSubmit = () => {
    if (visaType && appliedDate) {
      const daysSinceApplied = Math.floor((new Date() - new Date(appliedDate)) / (1000 * 60 * 60 * 24));
      
      // Determine estimated status based on days since applied and visa type
      let estimatedStatus = 'Processing Started';
      let statusType = 'info';
      
      const avgProcessingDays = visaType.includes('H-1B') ? 98 : 56; // 14 weeks vs 8 weeks
      const progressPercentage = (daysSinceApplied / avgProcessingDays) * 100;
      
      if (progressPercentage < 25) {
        estimatedStatus = 'Initial Review';
        statusType = 'info';
      } else if (progressPercentage < 50) {
        estimatedStatus = 'Document Verification';
        statusType = 'info';
      } else if (progressPercentage < 75) {
        estimatedStatus = 'Background Processing';
        statusType = 'warning';
      } else if (progressPercentage < 95) {
        estimatedStatus = 'Final Review';
        statusType = 'warning';
      } else {
        estimatedStatus = 'Decision Pending';
        statusType = 'success';
      }
      
      // Simulate fetching user application data
      const mockUserData = {
        visaType,
        appliedDate,
        status: estimatedStatus,
        statusType: statusType,
        daysSinceApplied: daysSinceApplied,
        estimatedCompletion: '2-4 weeks',
        similarApplications: 1247,
        averageProcessingTime: visaType.includes('H-1B') ? '14 weeks' : '8 weeks',
        approvalRate: visaType.includes('F-1') ? 95 : 85,
      };
      setUserApplicationData(mockUserData);
      setShowAnalytics(true);
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus && userApplicationData) {
      // Update the user application data with new status
      const updatedData = {
        ...userApplicationData,
        lastUpdate: new Date().toLocaleDateString(),
        userStatus: newStatus,
        statusNotes: statusNotes,
        statusHistory: [
          ...(userApplicationData.statusHistory || []),
          {
            status: newStatus,
            date: new Date().toLocaleDateString(),
            notes: statusNotes,
          }
        ]
      };
      setUserApplicationData(updatedData);
      setShowStatusUpdate(false);
      setNewStatus('');
      setStatusNotes('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
                Visa Analytics Dashboard
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Track your application and see processing insights
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4} style={{ display: 'flex', justifyContent: 'center' }}>
          {/* Application Tracker Form */}
          <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Get Processing Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enter your details to see visa processing insights
                    </Typography>
                  </Box>
                    <Grid container spacing={2}>
                        <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Visa Type</InputLabel>
                                <Select
                                value={visaType}
                                label="Visa Type"
                                onChange={(e) => setVisaType(e.target.value)}
                                >
                                {visaTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                    {type}
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                            <TextField
                                fullWidth
                                label="Applied Date"
                                type="date"
                                value={appliedDate}
                                onChange={(e) => setAppliedDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                            />
                        </Grid>
                    </Grid>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!visaType || !appliedDate}
                    startIcon={<Analytics />}
                  >
                    Get Analytics
                  </Button>

                  {userApplicationData && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Analytics generated for {userApplicationData.visaType} applied on {formatDate(userApplicationData.appliedDate)}
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Analytics Dashboard */}
          <Grid item size={{ xs: 12, sm: 12, md: 12 ,lg: 12 }}>
            {!showAnalytics ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Enter Your Application Details
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Fill in the form on the left to see personalized visa processing analytics
                  and compare your application with similar cases.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={4}>
                {/* User Application Status */}
                {userApplicationData && (
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Application Overview
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Key information for {userApplicationData.visaType} applied on {formatDate(userApplicationData.appliedDate)}
                          </Typography>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3}}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {userApplicationData.visaType.split(' ')[0]}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Visa Category
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3}}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight="bold">
                                {userApplicationData.daysSinceApplied}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Days Since Applied
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3}}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight="bold">
                                {Math.round((userApplicationData.daysSinceApplied / (visaType.includes('H-1B') ? 98 : 56)) * 100)}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Timeline Progress
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3}}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight="bold">
                                {userApplicationData.approvalRate}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Approval Rate
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Expected Processing Timeline
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((userApplicationData.daysSinceApplied / (visaType.includes('H-1B') ? 98 : 56)) * 100, 100)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Based on average processing times for {userApplicationData.visaType}
                          </Typography>
                        </Box>

                        {/* Status Update Section */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {userApplicationData.userStatus ? 'Latest Update: ' + userApplicationData.userStatus : 'No status updates yet'}
                            </Typography>
                            {userApplicationData.lastUpdate && (
                              <Typography variant="caption" color="text.secondary">
                                Updated on {userApplicationData.lastUpdate}
                              </Typography>
                            )}
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setShowStatusUpdate(true)}
                            startIcon={<Assignment />}
                          >
                            Update Status
                          </Button>
                        </Box>

                        {/* Status Update Modal */}
                        {showStatusUpdate && (
                          <Card sx={{ mt: 2, border: '1px solid', borderColor: 'primary.main' }}>
                            <CardContent sx={{ p: 3 }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Update Application Status
                              </Typography>
                              
                              <Stack spacing={3}>
                                <FormControl fullWidth>
                                  <InputLabel>Status Update</InputLabel>
                                  <Select
                                    value={newStatus}
                                    label="Status Update"
                                    onChange={(e) => setNewStatus(e.target.value)}
                                  >
                                    {statusUpdateOptions.map((status) => (
                                      <MenuItem key={status} value={status}>
                                        {status}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <TextField
                                  fullWidth
                                  label="Notes (Optional)"
                                  multiline
                                  rows={3}
                                  value={statusNotes}
                                  onChange={(e) => setStatusNotes(e.target.value)}
                                  placeholder="Add any additional notes about this status update..."
                                />

                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                  <Button
                                    variant="outlined"
                                    onClick={() => {
                                      setShowStatusUpdate(false);
                                      setNewStatus('');
                                      setStatusNotes('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="contained"
                                    onClick={handleStatusUpdate}
                                    disabled={!newStatus}
                                  >
                                    Update Status
                                  </Button>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Key Metrics */}
                <Grid container spacing={3} justifyContent="center">
                  <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3}}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {userApplicationData?.similarApplications.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Similar Applications
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3}}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <AccessTime sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {userApplicationData?.averageProcessingTime}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Processing Time
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3}}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {statusDistribution[0].value}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Approval Rate
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 3}}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          +12%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Approval Rate Trend
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Processing Times Chart */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Processing Times Comparison
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Standard vs Premium processing times over the last 6 months
                        </Typography>
                      </Box>
                      
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={processingTimesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis label={{ value: 'Weeks', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="standard" 
                              stroke="#2563EB" 
                              strokeWidth={3}
                              name="Standard Processing"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="premium" 
                              stroke="#16A34A" 
                              strokeWidth={3}
                              name="Premium Processing"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ p: 2, backgroundColor: 'primary.50', borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Schedule color="primary" />
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Standard Processing
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Current average: 15 weeks
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ p: 2, backgroundColor: 'success.50', borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Speed color="success" />
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Premium Processing
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Current average: 4 weeks
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Application Volume and Status Distribution */}
                <Grid container spacing={3}>
                  <Grid item size={{ xs: 12, sm: 12, md: 8, lg: 8 }}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Application Volume Trends
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Monthly application submissions for {userApplicationData?.visaType}
                        </Typography>
                        
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={applicationVolumeData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#2563EB" 
                                fill="#2563EB" 
                                fillOpacity={0.3}
                                name="Total Applications"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Status Distribution
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Current application statuses
                        </Typography>
                        
                        <Box sx={{ height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {statusDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>

                        <Stack spacing={1} sx={{ mt: 2 }}>
                          {statusDistribution.map((item) => (
                            <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 1,
                                    backgroundColor: item.color,
                                  }}
                                />
                                <Typography variant="body2">{item.name}</Typography>
                              </Stack>
                              <Typography variant="body2" fontWeight="bold">
                                {item.value}%
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Additional Insights */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Key Insights for Your Application
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mt: 1 }} justifyContent="center">
                      <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Peak Season Impact
                          </Typography>
                          <Typography variant="body2">
                            Applications submitted in April typically take 20% longer to process due to high volume.
                          </Typography>
                        </Alert>
                        
                        <Alert severity="success">
                          <Typography variant="subtitle2" fontWeight="bold">
                            Processing Acceleration
                          </Typography>
                          <Typography variant="body2">
                            Your visa type has seen 15% faster processing times this quarter compared to last year.
                          </Typography>
                        </Alert>
                      </Grid>
                      
                      <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Premium Processing Option
                          </Typography>
                          <Typography variant="body2">
                            Consider premium processing to reduce wait time from 15 weeks to 4 weeks for an additional fee.
                          </Typography>
                        </Alert>
                        
                        <Alert severity="info">
                          <Typography variant="subtitle2" fontWeight="bold">
                            Similar Applications
                          </Typography>
                          <Typography variant="body2">
                            {userApplicationData?.similarApplications} applications with similar profiles are currently in the system.
                          </Typography>
                        </Alert>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default VisaAnalytics;
