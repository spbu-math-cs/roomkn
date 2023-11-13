import "./SignIn.css";
import React, {useContext, useEffect} from "react";
import ContentWrapper from '../components/Content';
import {useAuthorize, IsAuthorizedContext} from "../components/Auth";

function SignInForm() {
        const [username, setUsername] = React.useState(null)
        const [password, setPassword] = React.useState(null)

        const {statusCode, authorize, finished} = useAuthorize(username, password)

        const handleSubmit = (e) => {
                e.preventDefault();
                authorize()
                console.log(username, password)
        };

        useEffect(() => {
                if (finished) {
                        if (statusCode === 400) alert("Error: incorrect username or password.")
                        else if (statusCode === 200) alert("Authorization succeeded!");
                        else alert("statusCode: " + statusCode)
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [finished])

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