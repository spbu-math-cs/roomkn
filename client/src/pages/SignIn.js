import "./SignIn.css";
//import React, {useContext, useEffect} from "react";
import ContentWrapper from '../components/Content';
import {
    IsAuthorizedContext,
    CurrentUserContext,
} from "../components/Auth";

import React, {useContext, useState} from "react";
import useSomeAPI from "../api/FakeAPI";

import { SnackbarContext } from "../components/SnackbarAlert";
import {Container} from "@pixi/react";
import {Avatar, Box, Button, Grid, TextField, Typography} from "@mui/material";
import {NavLink, useNavigate} from "react-router-dom";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Copyright from "../components/Copyright";

const IS_ADMIN_DEFAULT = true;
export const IS_ADMIN_GUEST = true;

function SignInForm() {
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)

    const user = {
        username: username,
        password: password
    }

    const {setIsAuthorized} = useContext(IsAuthorizedContext)
    const {setCurrentUser} = useContext(CurrentUserContext)

    const {headers, triggerFetch} = useSomeAPI("/api/v0/login", user, "POST", authCallback)

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    const navigate = useNavigate()

    function authCallback(result, statusCode) {
        console.log('invoked auth callback')
        if (result != null) {
            if (statusCode === 200) {
                const userData = {
                    user_id: result?.id,
                    username: username,
                    csrf_token: headers['X-CSRF-Token'],
                    is_admin: IS_ADMIN_DEFAULT
                }

                console.log('user set to ' + userData)
                setCurrentUser(userData)
                setIsAuthorized(true)

                navigate(`/`)
            } else {
                setIsAuthorized(false)
                setCurrentUser(null)
                setNewMessageSnackbar("Incorrect username or password. Please try again.")
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setUsername(data.get('username'))
        setPassword(data.get('password'))
        triggerFetch()
        console.log(username, password)
    };

    return (
        <div>
            <ContentWrapper page_name="">
                <Container component="main" maxWidth="xs">
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
                            Sign in
                        </Typography>
                        <Box component="form" maxWidth="500px" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="ivanov"
                                autoFocus
                                onChange={(e) => setUsername(e.target)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="secondary"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    {/*<Link href="#" variant="body2">*/}
                                    {/*    Forgot password?*/}
                                    {/*</Link>*/}
                                </Grid>
                                <Grid item>
                                    {/*<NavLink to="/sign-up" variant="body2">*/}
                                    {/*    {"Don't have an account? Sign Up"}*/}
                                    {/*</NavLink>*/}
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Copyright sx={{ mt: 8, mb: 4 }} />
                </Container>
            </ContentWrapper>
        </div>
    );
}

function SignIn() {
    return (
        <>
            <SignInForm></SignInForm>
        </>
    )
}

export default SignIn;