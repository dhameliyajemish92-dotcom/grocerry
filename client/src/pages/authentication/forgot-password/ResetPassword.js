import styles from '../form.module.css';
import { useNavigate } from "react-router-dom";
import Authentication from "../Authentication";
import { useState } from "react";
import Error from "../../../components/feedback/error/Error";
import { resetPassword } from "../../../actions/auth";
import { useDispatch } from "react-redux";

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [data, setData] = useState({
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const email = localStorage.getItem('resetEmail');

    if (!email) {
        navigate('/forgot-password');
    }

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const handleReset = () => {
        const { otp, newPassword, confirmPassword } = data;

        if (!otp) return setError("Enter the OTP from your email");
        if (!newPassword) return setError("Enter a new password");
        if (newPassword !== confirmPassword) return setError("Passwords do not match");
        if (newPassword.length < 6) return setError("Password must be at least 6 characters");

        setIsLoading(true);

        const onSuccess = () => {
            setIsLoading(false);
            localStorage.removeItem('resetEmail');
            alert("Password updated successfully! Please login.");
            navigate('/login');
        }

        const onError = (err) => {
            setIsLoading(false);
            setError(err.message || "Something went wrong");
        }

        dispatch(resetPassword({ email, otp, newPassword }, onSuccess, onError));
    }

    const form = (
        <div className={styles['wrapper']}>
            {error && <Error error={error} setError={setError} />}
            <div className={styles['header']}>
                <div className={styles['title']}>Reset Password</div>
                <div className={styles['login']}>Check your email ({email}) for the OTP.</div>
            </div>
            <div className={styles['form']}>
                <input
                    onChange={handleChange}
                    name={'otp'}
                    value={data.otp}
                    placeholder={'Enter OTP'}
                    type={'text'}
                />
                <input
                    onChange={handleChange}
                    name={'newPassword'}
                    value={data.newPassword}
                    placeholder={'New Password'}
                    type={'password'}
                />
                <input
                    onChange={handleChange}
                    name={'confirmPassword'}
                    value={data.confirmPassword}
                    placeholder={'Confirm New Password'}
                    type={'password'}
                />
                <button onClick={handleReset} className={'btn1'} disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Update Password'}
                </button>
            </div>
        </div>
    );

    return <Authentication data={form} />;
}

export default ResetPassword;
