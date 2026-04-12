import styles from '../form.module.css';
import { useNavigate } from "react-router-dom";
import Authentication from "../Authentication";
import { useState } from "react";
import Error from "../../../components/feedback/error/Error";
import { forgotPassword } from "../../../actions/auth";
import { useDispatch } from "react-redux";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestOtp = () => {
        if (!email) return setError("Enter your email address");
        setIsLoading(true);

        const onSuccess = () => {
            setIsLoading(false);
            localStorage.setItem('resetEmail', email);
            navigate('/reset-password');
        }

        const onError = (err) => {
            setIsLoading(false);
            setError(err.message || "Something went wrong");
        }

        dispatch(forgotPassword(email, onSuccess, onError));
    }

    const form = (
        <div className={styles['wrapper']}>
            {error && <Error error={error} setError={setError} />}
            <div className={styles['header']}>
                <div className={styles['title']}>Forgot Password?</div>
                <div className={styles['login']}>Enter your email to receive a reset OTP.</div>
            </div>
            <div className={styles['form']}>
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    name={'email'}
                    value={email}
                    placeholder={'Email Address'}
                    type={'email'}
                />
                <button onClick={handleRequestOtp} className={'btn1'} disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
            </div>
        </div>
    );

    return <Authentication data={form} />;
}

export default ForgotPassword;
