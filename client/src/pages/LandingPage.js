import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/helpers';

const LandingPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // 0 for login, 1 for register
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
    agreeToTerms: false,
  });

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
      // Handle successful login - redirect to community dashboard
      console.log('Login successful');
      navigate('/community');
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

    if (!registerData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      // Handle successful registration - redirect to community dashboard
      console.log('Registration successful');
      navigate('/community');
    } else {
      setError(result.error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            maxWidth: 500,
            mx: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
              color: 'white',
              p: 3,
              textAlign: 'center',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
              <School sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold">
                Student Hub
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {activeTab === 0
                ? 'Welcome back! Sign in to your account'
                : 'Create your account and join our community'}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Sign In" />
                <Tab label="Create Account" />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {activeTab === 0 ? (
              // Login Form
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
                </Stack>
              </form>
            ) : (
              // Registration Form
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
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Stack>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LandingPage;
