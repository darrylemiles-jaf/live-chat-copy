import { useNavigate } from 'react-router-dom';
import { customGreen } from 'themes/palette';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Formik } from 'formik';

import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import * as Yup from 'yup';

import axiosServices from 'utils/axios';
import useAuth from 'hooks/useAuth';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async (values, { setErrors, setStatus, setSubmitting }) => {
    try {
      const response = await axiosServices.post('/users/login', {
        email: values.email,
        password: values.password
      });

      console.log('Login response:', response);

      if (response.data?.success) {
        const token = response.data?.token;
        const user = response.data?.data; // Backend returns user in 'data' field

        if (!token) {
          console.error('No token in response:', response.data);
          throw new Error('No token received from server');
        }

        if (!user) {
          console.error('No user data in response:', response.data);
          throw new Error('No user data received from server');
        }

        // Use the useAuth hook to store user and token
        const loginSuccess = login(user, token);

        if (!loginSuccess) {
          throw new Error('Failed to store authentication data');
        }

        // Also store token in serviceToken for backward compatibility
        localStorage.setItem('serviceToken', token);

        setStatus({ success: true });
        setSubmitting(false);

        // Redirect to dashboard
        navigate('/portal/dashboard');
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      setStatus({ success: false });
      setSubmitting(false);

      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';

      if (error.response?.status === 403) {
        showSnackbar(errorMessage, 'error');
      } else {
        setErrors({ submit: errorMessage });
      }
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string()
            .required('Password is required')
            .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value.trim())
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must be less than 128 characters')
        })}
        onSubmit={handleLogin}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ paddingTop: 5 }}>
              <Grid size={12}>
                <Stack sx={{ gap: 1.5 }}>
                  <InputLabel
                    htmlFor="email-login"
                    sx={{
                      color: customGreen[7],
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Email Address
                  </InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: customGreen[2],
                        borderWidth: '2px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: customGreen[5],
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customGreen[7],
                        borderWidth: '2px',
                      },
                      '& input': {
                        py: 1.5,
                      }
                    }}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1.5 }}>
                  <InputLabel
                    htmlFor="password-login"
                    sx={{
                      color: customGreen[7],
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Password
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{
                            color: customGreen[6],
                            '&:hover': {
                              color: customGreen[7],
                              backgroundColor: customGreen[0],
                            }
                          }}
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter your password"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: customGreen[2],
                        borderWidth: '2px',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: customGreen[5],
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customGreen[7],
                        borderWidth: '2px',
                      },
                      '& input': {
                        py: 1.5,
                      }
                    }}
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>

              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid size={12} sx={{ mt: 1 }}>
                <AnimateButton>
                  <Button
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      backgroundColor: customGreen[7],
                      color: '#fff',
                      py: 1.75,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: customGreen[8],
                        boxShadow: `0 4px 12px ${customGreen[3]}`,
                      },
                      '&:active': {
                        backgroundColor: customGreen[9],
                      },
                      '&:disabled': {
                        backgroundColor: customGreen[3],
                        color: '#fff',
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
