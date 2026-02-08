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

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSignup = () => {
        setError('');
        dispatch(authSignup(formData, (data) => {
            setMessage(data.message);
            setStep('verify');
        }, (err) => {
            setError(err.message);
        }));
    }

    const handleVerify = () => {
        setError('');
        dispatch(verifyOtp(formData.email, otp, () => {
            navigate('/');
        }, (err) => {
            setError(err.message);
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
            {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            {step === 'signup' && (
                <div className={styles['form']}>
                    <input name="first_name" placeholder={'First Name'} onChange={handleChange} value={formData.first_name} />
                    <input name="last_name" placeholder={'Last Name'} onChange={handleChange} value={formData.last_name} />
                    <input name="email" placeholder={'Email'} onChange={handleChange} value={formData.email} />
                    <input name="password" placeholder={'Password'} type={'password'} onChange={handleChange} value={formData.password} />
                    <button className={'btn1'} onClick={handleSignup}>Sign Up</button>
                </div>
            )}

            {step === 'verify' && (
                <div className={styles['form']}>
                    <input placeholder={'Enter OTP'} onChange={(e) => setOtp(e.target.value)} value={otp} />
                    <button className={'btn1'} onClick={handleVerify}>Verify OTP</button>
                </div>
            )}
        </div>

    return <Authentication data={form} />
}

export default Signup;