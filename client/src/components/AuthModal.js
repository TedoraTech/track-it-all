import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  School,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/helpers';

const AuthModal = ({ open, onClose, mode, onModeChange }) => {
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    university: '',
    graduationYear: '',
    visaStatus: '',
    howDidYouFindUs: '',
    agreeToTerms: false,
    subscribeToNewsletter: true,
  });

  const universities = [
    'Harvard University',
    'Stanford University',
    'MIT',
    'UC Berkeley',
    'Carnegie Mellon University',
    'University of Washington',
    'Georgia Tech',
    'UCLA',
    'USC',
    'NYU',
    'Columbia University',
    'Yale University',
    'Princeton University',
    'Other',
  ];

  const visaStatuses = [
    'F-1 Student Visa',
    'J-1 Exchange Visitor',
    'B-1/B-2 Tourist/Business',
    'H-1B Work Visa',
    'Green Card Holder',
    'US Citizen',
    'Other',
  ];

  const howDidYouFindUsOptions = [
    'Google Search',
    'Social Media (Facebook, Instagram, etc.)',
    'Friend Referral',
    'University Website',
    'Student Forum',
    'YouTube',
    'LinkedIn',
    'Immigration Lawyer',
    'Other',
  ];

  const graduationYears = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return year.toString();
  });

  const handleClose = () => {
    setError('');
    setLoginData({ email: '', password: '', rememberMe: false });
    setRegisterData({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      university: '',
      graduationYear: '',
      visaStatus: '',
      howDidYouFindUs: '',
      agreeToTerms: false,
      subscribeToNewsletter: true,
    });
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(loginData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!loginData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    const result = await login(loginData.email, loginData.password);
    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!registerData.displayName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!validateEmail(registerData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(registerData.password)) {
      setError(
        'Password must be at least 8 characters with uppercase, lowercase, and number'
      );
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!registerData.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!registerData.university) {
      setError('Please select your university');
      return;
    }

    if (!registerData.graduationYear) {
      setError('Please select your graduation year');
      return;
    }

    if (!registerData.visaStatus) {
      setError('Please select your visa status');
      return;
    }

    if (!registerData.howDidYouFindUs) {
      setError('Please tell us how you found us');
      return;
    }

    if (!registerData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ position: 'relative' }}>
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
              color: 'white',
              p: 3,
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white',
              }}
            >
              <Close />
            </IconButton>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
              <School sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                Student Hub
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              {mode === 'login'
                ? 'Welcome back! Sign in to your account'
                : 'Join thousands of international students'}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={loginData.rememberMe}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              rememberMe: e.target.checked,
                            })
                          }
                        />
                      }
                      label="Remember me"
                    />
                    <Link
                      href="#"
                      variant="body2"
                      sx={{ textDecoration: 'none' }}
                    >
                      Forgot password?
                    </Link>
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                  </Button>

                  <Divider>
                    <Typography variant="body2" color="text.secondary">
                      or continue with
                    </Typography>
                  </Divider>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Google />}
                      sx={{ py: 1.5, borderRadius: 2 }}
                    >
                      Google
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Facebook />}
                      sx={{ py: 1.5, borderRadius: 2 }}
                    >
                      Facebook
                    </Button>
                  </Stack>

                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => onModeChange('register')}
                        sx={{ textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        Sign up here
                      </Link>
                    </Typography>
                  </Box>
                </Stack>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={registerData.displayName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        displayName: e.target.value,
                      })
                    }
                    required
                  />

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    required
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={registerData.phoneNumber}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+1 (555) 123-4567"
                    required
                  />

                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>

                  <FormControl fullWidth required>
                    <InputLabel>University</InputLabel>
                    <Select
                      value={registerData.university}
                      label="University"
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          university: e.target.value,
                        })
                      }
                    >
                      {universities.map((uni) => (
                        <MenuItem key={uni} value={uni}>
                          {uni}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth required>
                      <InputLabel>Expected Graduation Year</InputLabel>
                      <Select
                        value={registerData.graduationYear}
                        label="Expected Graduation Year"
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            graduationYear: e.target.value,
                          })
                        }
                      >
                        {graduationYears.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                      <InputLabel>Current Visa Status</InputLabel>
                      <Select
                        value={registerData.visaStatus}
                        label="Current Visa Status"
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            visaStatus: e.target.value,
                          })
                        }
                      >
                        {visaStatuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <FormControl fullWidth required>
                    <InputLabel>How did you find us?</InputLabel>
                    <Select
                      value={registerData.howDidYouFindUs}
                      label="How did you find us?"
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          howDidYouFindUs: e.target.value,
                        })
                      }
                    >
                      {howDidYouFindUsOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={registerData.agreeToTerms}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              agreeToTerms: e.target.checked,
                            })
                          }
                          required
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the{' '}
                          <Link href="#" sx={{ textDecoration: 'none' }}>
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="#" sx={{ textDecoration: 'none' }}>
                            Privacy Policy
                          </Link>
                        </Typography>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={registerData.subscribeToNewsletter}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              subscribeToNewsletter: e.target.checked,
                            })
                          }
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Subscribe to our newsletter for updates and tips
                        </Typography>
                      }
                    />
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create Account'}
                  </Button>

                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => onModeChange('login')}
                        sx={{ textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        Sign in here
                      </Link>
                    </Typography>
                  </Box>
                </Stack>
              </form>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
