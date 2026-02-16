import styles from '../form.module.css';
import Authentication from "../Authentication";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { authSignup, verifyOtp } from "../../../actions/auth";

const Signup = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('signup'); // signup, verify
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSignup = () => {
        if (isLoading) return;
        setError('');
        setIsLoading(true);
        console.log("Signup starting with data:", { ...formData, password: '***' });

        dispatch(authSignup(formData, (data) => {
            console.log("Signup success response:", data);
            setIsLoading(false);
            setMessage(data.message || "User registered. Please check your email.");
            setStep('verify');
        }, (err) => {
            console.error("Signup error response:", err);
            setIsLoading(false);
            setError(err.message || "Signup failed. Please check your connection.");
        }));
    }

    const handleVerify = () => {
        if (isLoading) return;
        setError('');
        setIsLoading(true);
        console.log("Verification starting for:", formData.email, "with OTP:", otp);

        dispatch(verifyOtp(formData.email, otp, () => {
            console.log("Verification successful");
            setIsLoading(false);
            navigate('/');
        }, (err) => {
            console.error("Verification error:", err);
            setIsLoading(false);
            setError(err.message || "Verification failed. Incorrect OTP.");
        }));
    }

    const form =
        <div className={styles['wrapper']}>
            <div className={styles['header']}>
                <div className={styles['title']}>
                    {step === 'signup' ? 'Sign up with your email' : 'Verify Email'}
                </div>
                {step === 'signup' && <div className={styles['login']}>Already have an account? <Link to={'/login'}>Login</Link></div>}
            </div>
            {message && <div style={{ color: 'green', marginBottom: '10px', whiteSpace: 'pre-line' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            {step === 'signup' && (
                <div className={styles['form']}>
                    <input name="first_name" placeholder={'First Name'} onChange={handleChange} value={formData.first_name} />
                    <input name="last_name" placeholder={'Last Name'} onChange={handleChange} value={formData.last_name} />
                    <input name="email" placeholder={'Email'} onChange={handleChange} value={formData.email} />
                    <input name="password" placeholder={'Password'} type={'password'} onChange={handleChange} value={formData.password} />
                    <button className={'btn1'} onClick={handleSignup} disabled={isLoading}>
                        {isLoading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </div>
            )}

            {step === 'verify' && (
                <div className={styles['form']}>
                    <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                        <p>We have sent a 6-digit OTP to your registered email address.</p>
                        <p>Please enter the OTP to verify your email and continue.</p>
                    </div>
                    <input placeholder={'Enter 6-digit OTP'} onChange={(e) => setOtp(e.target.value)} value={otp} />
                    <button className={'btn1'} onClick={handleVerify} disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                    <button className={'btn2'} onClick={handleSignup} style={{ marginTop: '10px' }}>Resend OTP</button>
                </div>
            )}
        </div>

    return <Authentication data={form} />
}

export default Signup;