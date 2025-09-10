"use client"

import LoginForm from "@/components/login-form"

export default function LoginPage() {

    return <LoginForm onLogin={function (token: string): void {
        localStorage.setItem("auth_token", token)
    } } />
}