import "./SignIn.css";
//import React, {useContext, useEffect} from "react";
import ContentWrapper from '../components/Content';
import {IsAuthorizedContext, CurrentUserContext, saveUserData} from "../components/Auth";

import React, {useContext, useState} from "react";
import useSomeAPI from "../api/FakeAPI";

import { SnackbarContext } from "../components/SnackbarAlert";

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
                saveUserData(userData)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
                setCurrentUser(null)
                setNewMessageSnackbar("Incorrect username or password. Please try again.")
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        triggerFetch()
        console.log(username, password)
    };

    return (
        <div>
            <ContentWrapper page_name="Sign In">
                <form className="sign-in-form" onSubmit={handleSubmit}>
                    <div className="sign-in-form-name">
                        Enter the system
                    </div>
                    <div className="sign-in-form-field">
                        <label className="sign-in-form-label">
                            Username
                        </label>
                        <input className="sign-in-form-input"
                               placeholder="ivanov"
                               onChange={(e) => setUsername(e.target.value)}>

                        </input>
                    </div>
                    <div className="sign-in-form-field">
                        <label className="sign-in-form-label">
                            Password
                        </label>
                        <input className="sign-in-form-input"
                               placeholder="********"
                               type="password"
                               onChange={(e) => setPassword(e.target.value)}>
                        </input>
                    </div>
                    <div></div>
                    <input className="sign-in-form-submit" type="submit" value="Enter"></input>
                </form>
            </ContentWrapper>
        </div>
    );
}

function AuthorizationStatusLabel() {
    const {isAuthorized} = useContext(IsAuthorizedContext)

    if (isAuthorized) {
        return (
            <div className="authorization-label">
                <label className="authorization-label-authorized">You successfully authorized!</label>
            </div>
        )
    } else {
        return (
            <div className="authorization-label">
                <label className="authorization-label-not-authorized">You are not authorized. Please sign in.</label>
            </div>
        )
    }
}

function SignIn() {
    return (
        <>
            <AuthorizationStatusLabel/>
            <SignInForm></SignInForm>
        </>
    )
}

export default SignIn;