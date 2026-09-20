import React, { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import AuthShell from "@/Layouts/AuthShell";
import AuthInput from "@/Components/Auth/AuthInput";
import AuthPasswordInput from "@/Components/Auth/AuthPasswordInput";
import AuthSubmitButton from "@/Components/Auth/AuthSubmitButton";
import AuthAlert from "@/Components/Auth/AuthAlert";
import { User, Lock, Sliders } from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            username: "",
            password: "",
            remember: false,
        });

    const [activePreset, setActivePreset] = useState("default");
    const [customAlert, setCustomAlert] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (import.meta.env.DEV && activePreset !== "default") {
            if (activePreset === "invalid_credentials") {
                setError(
                    "username",
                    "Invalid username or password. Please check your credentials and try again.",
                );
                return;
            }
            if (activePreset === "inactive_account") {
                setCustomAlert({
                    type: "error",
                    title: "Account Unavailable",
                    message:
                        "This account is currently unavailable. Please contact your administrator.",
                });
                return;
            }
            if (activePreset === "auth_error") {
                setCustomAlert({
                    type: "error",
                    title: "Authentication Error",
                    message:
                        "We could not complete your authentication request. Please try again.",
                });
                return;
            }
        }
        post("/login");
    };

    const applyPreset = (presetKey) => {
        setActivePreset(presetKey);
        clearErrors();
        setCustomAlert(null);

        if (presetKey === "invalid_credentials") {
            setError(
                "username",
                "Invalid username or password. Please check your credentials and try again.",
            );
        } else if (presetKey === "inactive_account") {
            setCustomAlert({
                type: "error",
                title: "Account Unavailable",
                message:
                    "This account is currently unavailable. Please contact your administrator.",
            });
        } else if (presetKey === "auth_error") {
            setCustomAlert({
                type: "error",
                title: "Authentication Error",
                message:
                    "We could not complete your authentication request. Please try again.",
            });
        } else if (presetKey === "session_expired") {
            setCustomAlert({
                type: "warning",
                title: "Session Expired",
                message:
                    "Your session has expired for security reasons. Please sign in again.",
            });
        }
    };

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to access your DMRS account"
        >
            <Head title="Sign In - DMRS" />

            {/* Session status / alert message */}
            {status && <AuthAlert type="info" message={status} />}
            {customAlert && (
                <AuthAlert
                    type={customAlert.type}
                    title={customAlert.title}
                    message={customAlert.message}
                />
            )}
            {errors.auth && <AuthAlert type="error" message={errors.auth} />}

            {/* Primary Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                    label="Username"
                    id="username"
                    type="text"
                    value={data.username}
                    onChange={(e) => setData("username", e.target.value)}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    icon={User}
                    error={errors.username}
                />

                <AuthPasswordInput
                    label="Password"
                    id="password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    icon={Lock}
                    error={errors.password}
                />

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center text-xs text-slate-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
                        />
                        <span className="ml-2 font-medium">Remember me</span>
                    </label>
                </div>

                <AuthSubmitButton
                    loading={
                        processing ||
                        (import.meta.env.DEV && activePreset === "loading")
                    }
                    loadingText="Signing in..."
                    className="mt-2"
                >
                    Sign In
                </AuthSubmitButton>
            </form>
        </AuthShell>
    );
}
