import "./SignIn.css";
import React from "react";
import ContentWrapper from '../components/Content';
import { Form } from "react-router-dom";
import callSomeAPI from "../api/FakeAPI";

function SignInCall(username, password) {

    const user = {
        username: username,
        password: password
    }

    let [result, loading, error] = callSomeAPI("/api/v0/login", user, "POST")

    if (error === 400) alert("Ошибка: неверное имя пользователя или пароль.")
    else alert("Регистрация успешна!");
}

function SignInForm() {
    const [username, setUsername] = React.useState(null)
    const [password, setPassword] = React.useState(null)

    const handleSubmit = (e) => {
        e.preventDefault();
        SignInCall(username, password);
        console.log(username, password)
      };

    return (
        <div>
            <ContentWrapper page_name="Авторизация" onSubmit={handleSubmit}>
                <form className="sign-in-form">
                    <div className="sign-in-form-name">
                        Вход в систему
                    </div>
                    <div className="sign-in-form-field">
                        <label className="sign-in-form-label">
                            Имя пользователя
                        </label>
                        <input className="sign-in-form-input" onChange={(e) => setUsername(e.target.value)}>

                        </input>
                    </div>
                    <div className="sign-in-form-field">
                        <label className="sign-in-form-label">
                            Пароль
                        </label>
                    <input className="sign-in-form-input" type="password" onChange={(e) => setPassword(e.target.value)}>
                    </input>
                    </div>
                    <div></div>
                    <input className="sign-in-form-submit" type="submit" value="Войти"></input>
                </form>
            </ContentWrapper>
        </div>
    );
}

function SignIn() {
    return (
        <>
            <label className="sign-in-label">Вы не авторизованы в системе. Пожалуйста, выполните вход.</label>
            <SignInForm></SignInForm>
        </>
    )
};
 
export default SignIn;