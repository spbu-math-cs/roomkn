import "./SignUp.css";
import React, {useContext, useEffect} from "react";
import ContentWrapper from '../components/Content';
import { Form } from "react-router-dom";
import useSomeAPI from "../api/FakeAPI";
import {useAuthorize, IsAuthorizedContext, useRegister} from "../components/Auth";

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
            alert("Пароли не совпадают")
        }
    };

    useEffect(() => {
        if (finished) {
            if (statusCode === 409) alert("Ошибка: имя пользователя или email уже заняты")
            else if (statusCode === 200) alert("Регистрация успешна!");
            else alert("statusCode: " + statusCode)
        }
    }, [finished])

    return (
        <div>
            <ContentWrapper page_name="Регистрация">
                <form className="sign-up-form" onSubmit={handleSubmit}>
                    <div className="sign-up-form-name">
                        Регистрация в системе
                    </div>
                    <div className="sign-up-form-field">
                        <label className="sign-up-form-label">
                            Имя пользователя
                        </label>
                        <input className="sign-up-form-input" onChange={(e) => setUsername(e.target.value)}>

                        </input>
                    </div>
                    <div className="sign-up-form-field">
                        <label className="sign-up-form-label">
                            Email
                        </label>
                        <input className="sign-up-form-input" type="email" onChange={(e) => setEmail(e.target.value)}>

                        </input>
                    </div>
                    <div className="sign-up-form-field">
                        <label className="sign-up-form-label">
                            Пароль
                        </label>
                        <input className="sign-up-form-input" type="password" onChange={(e) => setPassword(e.target.value)}>
                        </input>
                    </div>
                    <div className="sign-up-form-field">
                        <label className="sign-up-form-label">
                            Повторите пароль
                        </label>
                        <input className="sign-up-form-input" type="password" onChange={(e) => setPassword2(e.target.value)}>
                        </input>
                    </div>
                    <div></div>
                    <input className="sign-up-form-submit" type="submit" value="Войти"></input>
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
};

export default SignUp;