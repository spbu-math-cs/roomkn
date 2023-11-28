import "./SignUp.css";
import React, {useContext} from "react";
import useSomeAPI from '../api/FakeAPI'
import ContentWrapper from '../components/Content';
import {IsAuthorizedContext, CurrentUserContext, saveUserData} from "../components/Auth";

const IS_ADMIN_DEFAULT = true;

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
        


        const handleSubmit = (e) => {
                e.preventDefault();

                if (password === password2) {
                        triggerFetch()
                        console.log(username, password)
                } else {
                        alert("Passwords are not equal")
                }
        };

        function registerCallback(result, statusCode) {
                if (statusCode === 409) alert("Error: user with this username or email already exists")
                else if (statusCode === 200 && result != null) {
                        console.log(result)
                        const userData = {
                                user_id: result?.id,
                                username: username,
                                csrf_token: headers['X-CSRF-Token'],
                                is_admin: IS_ADMIN_DEFAULT
                        }
                        alert("Registration succeeded!");
                        console.log('user data:')
                        console.log(userData)
                        setCurrentUser(userData)
                        saveUserData(userData)
                        setIsAuthorized(true)
                }
                else alert("statusCode: " + statusCode)
        }

        return (
                <div>
                        <ContentWrapper page_name="Sign Up">
                                <form className="sign-up-form" onSubmit={handleSubmit}>
                                        <div className="sign-up-form-name">
                                                Registration in system
                                        </div>
                                        <div className="sign-up-form-field">
                                                <label className="sign-up-form-label">
                                                        Username
                                                </label>
                                                <input className="sign-up-form-input"
                                                             placeholder="ivanov"
                                                             onChange={(e) => setUsername(e.target.value)}>

                                                </input>
                                        </div>
                                        <div className="sign-up-form-field">
                                                <label className="sign-up-form-label">
                                                        Email
                                                </label>
                                                <input className="sign-up-form-input"
                                                             placeholder="ivanov@example.com"
                                                             type="email"
                                                             onChange={(e) => setEmail(e.target.value)}>

                                                </input>
                                        </div>
                                        <div className="sign-up-form-field">
                                                <label className="sign-up-form-label">
                                                        Password
                                                </label>
                                                <input className="sign-up-form-input"
                                                             placeholder="********"
                                                             type="password"
                                                             onChange={(e) => setPassword(e.target.value)}>
                                                </input>
                                        </div>
                                        <div className="sign-up-form-field">
                                                <label className="sign-up-form-label">
                                                        Repeat password
                                                </label>
                                                <input className="sign-up-form-input"
                                                             placeholder="********"
                                                             type="password"
                                                             onChange={(e) => setPassword2(e.target.value)}>
                                                </input>
                                        </div>
                                        <div></div>
                                        <input className="sign-up-form-submit" type="submit" value="Register"></input>
                                </form>
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