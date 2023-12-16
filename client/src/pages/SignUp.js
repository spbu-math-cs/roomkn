import "./SignUp.css";
import React, {useContext} from "react";
import useSomeAPI from '../api/FakeAPI'
import ContentWrapper from '../components/Content';
import {IsAuthorizedContext, CurrentUserContext, saveUserData} from "../components/Auth";
import {SnackbarContext} from "../components/SnackbarAlert";
import {Avatar, Box, Button, CssBaseline, Grid, TextField, Typography} from "@mui/material";
import {NavLink} from "react-router-dom";
import {Container} from "@pixi/react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const IS_ADMIN_DEFAULT = true;

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <NavLink color="inherit" to="https://roomkn.kpnn.ru/">
                Tod87et team
            </NavLink>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

function SignUpForm() {
    const [username, setUsername] = React.useState(null)
    const [email, setEmail] = React.useState(null)
    const [password, setPassword] = React.useState(null)
    const [password2, setPassword2] = React.useState(null)

    const {setIsAuthorized} = useContext(IsAuthorizedContext)
    const {setCurrentUser} = useContext(CurrentUserContext)

    const user = {
            username: username,
            password: password,
            email: email
    }

    const { headers,
            triggerFetch
    } = useSomeAPI("/api/v0/register", user, "POST", registerCallback)

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setUsername(data.get('username'))
        setEmail(data.get('email'))
        setPassword(data.get('password'))
        setPassword2(data.get('password2'))


        if (password === password2) {
            triggerFetch()
            console.log(username, password)
        } else {
            setNewMessageSnackbar("Passwords are not equal")
        }
    };

    function registerCallback(result, statusCode) {
            if (statusCode === 409) setNewMessageSnackbar("Error: user with this username or email already exists")
            else if (statusCode === 200 && result != null) {
                    console.log(result)
                    const userData = {
                            user_id: result?.id,
                            username: username,
                            csrf_token: headers['X-CSRF-Token'],
                            is_admin: IS_ADMIN_DEFAULT
                    }
                    setNewMessageSnackbar("Registration succeeded!");
                    console.log('user data:')
                    console.log(userData)
                    setCurrentUser(userData)
                    saveUserData(userData)
                    setIsAuthorized(true)
            }
            else setNewMessageSnackbar("statusCode: " + statusCode)
    }

    return (
        <div>
            <ContentWrapper page_name="Sign Up">
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign up
                        </Typography>
                        <Box component="form" maxWidth="500px" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                autoComplete="username"
                                name="username"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password2"
                                label="Repeat password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                            />
                                    {/*<FormControlLabel*/}
                                    {/*    control={<Checkbox value="allowExtraEmails" color="primary" />}*/}
                                    {/*    label="I want to receive inspiration, marketing promotions and updates via email."*/}
                                    {/*/>*/}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="secondary"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign Up
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <NavLink to="/sign-in" variant="body2">
                                        Already have an account? Sign in
                                    </NavLink>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Copyright sx={{ mt: 8, mb: 4 }} />
                </Container>
                {/*<form className="sign-up-form" onSubmit={handleSubmit}>*/}
                {/*        <div className="sign-up-form-name">*/}
                {/*                Registration in system*/}
                {/*        </div>*/}
                {/*        <div className="sign-up-form-field">*/}
                {/*                <label className="sign-up-form-label">*/}
                {/*                        Username*/}
                {/*                </label>*/}
                {/*                <input className="sign-up-form-input"*/}
                {/*                       placeholder="ivanov"*/}
                {/*                       onChange={(e) => setUsername(e.target.value)}>*/}

                {/*                </input>*/}
                {/*        </div>*/}
                {/*        <div className="sign-up-form-field">*/}
                {/*                <label className="sign-up-form-label">*/}
                {/*                        Email*/}
                {/*                </label>*/}
                {/*                <input className="sign-up-form-input"*/}
                {/*                       placeholder="ivanov@example.com"*/}
                {/*                       type="email"*/}
                {/*                       onChange={(e) => setEmail(e.target.value)}>*/}

                {/*                </input>*/}
                {/*        </div>*/}
                {/*        <div className="sign-up-form-field">*/}
                {/*                <label className="sign-up-form-label">*/}
                {/*                        Password*/}
                {/*                </label>*/}
                {/*                <input className="sign-up-form-input"*/}
                {/*                       placeholder="********"*/}
                {/*                       type="password"*/}
                {/*                       onChange={(e) => setPassword(e.target.value)}>*/}
                {/*                </input>*/}
                {/*        </div>*/}
                {/*        <div className="sign-up-form-field">*/}
                {/*                <label className="sign-up-form-label">*/}
                {/*                        Repeat password*/}
                {/*                </label>*/}
                {/*                <input className="sign-up-form-input"*/}
                {/*                       placeholder="********"*/}
                {/*                       type="password"*/}
                {/*                       onChange={(e) => setPassword2(e.target.value)}>*/}
                {/*                </input>*/}
                {/*        </div>*/}
                {/*        <div></div>*/}
                {/*        <input className="sign-up-form-submit" type="submit" value="Register"></input>*/}
                {/*</form>*/}
            </ContentWrapper>
        </div>
    );
}

function SignUp() {
    return (
        <>
            <SignUpForm></SignUpForm>
        </>
    )
}

export default SignUp;