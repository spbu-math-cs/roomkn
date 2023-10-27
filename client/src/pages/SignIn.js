import "./SignIn.css";
import React, {useContext, useEffect} from "react";
import ContentWrapper from '../components/Content';
import { Form } from "react-router-dom";
import useSomeAPI from "../api/FakeAPI";
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
            if (statusCode === 400) alert("Ошибка: неверное имя пользователя или пароль.")
            else if (statusCode === 200) alert("Авторизация успешна!");
            else alert("statusCode: " + statusCode)
        }
    }, [finished])

    return (
        <div>
            <ContentWrapper page_name="Авторизация">
                <form className="sign-in-form" onSubmit={handleSubmit}>
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

function AuthorizationStatusLabel() {
    const {isAuthorized} = useContext(IsAuthorizedContext)

    if (isAuthorized) {
        return (
            <label className="authorization-label-authorized">Вы авторизованы в системе!</label>
        )
    } else {
        return (
            <label className="authorization-label-not-authorized">Вы не авторизованы в системе. Пожалуйста, выполните вход.</label>
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
};
 
export default SignIn;