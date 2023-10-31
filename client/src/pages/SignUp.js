import "./SignUp.css";
import React, {useEffect} from "react";
import ContentWrapper from '../components/Content';
import {useRegister} from "../components/Auth";

function SignUpForm() {
    const [username, setUsername] = React.useState(null)
    const [email, setEmail] = React.useState(null)
    const [password, setPassword] = React.useState(null)
    const [password2, setPassword2] = React.useState(null)


    const {statusCode, register, finished} = useRegister(username, password, email)

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password === password2) {
            register()
            console.log(username, password)
        } else {
            alert("Passwords are not equal")
        }
    };

    useEffect(() => {
        if (finished) {
            if (statusCode === 409) alert("Error: user with this username or password exits")
            else if (statusCode === 200) alert("Registration succeeded!");
            else alert("statusCode: " + statusCode)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished])

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
            {/*<AuthorizationStatusLabel/>*/}
            <SignUpForm></SignUpForm>
        </>
    )
}

export default SignUp;