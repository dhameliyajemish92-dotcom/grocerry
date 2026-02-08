import styles from './checkout.module.css';
import '../.././shared/css/master.css';
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Error from "../../components/feedback/error/Error";
import { postOrder, postOrderCOD } from "../../actions/orders";

const Checkout = () => {
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // 'ONLINE' or 'COD'

    const fname = useRef();
    const lname = useRef();
    const email = useRef();
    const phone = useRef();
    const street = useRef();
    const area = useRef();
    const city = useRef();
    const state = useRef();
    const pincode = useRef();

    const dispatch = useDispatch();

    const cart = useSelector(state => state.products.cart_validation);

    useEffect(() => {
        if (!cart) {
            window.location.href = '/cart';
        }
    }, [cart]);

    const handleCheckout = () => {
        if (!cart) return;

        if (!fname.current.value) return setError("Enter a first name");
        if (!lname.current.value) return setError("Enter a last name");
        if (!email.current.value) return setError("Enter an email address");
        if (!validateEmail(email.current.value)) return setError("Enter a valid email address");
        if (!phone.current.value) return setError("Enter a phone number");
        if (!validatePhone(phone.current.value)) return setError("Enter a valid phone number");

        if (!street.current.value) return setError("Enter a street address");
        if (!area.current.value) return setError("Enter an area/locality");
        if (!city.current.value) return setError("Enter a city");
        if (!state.current.value) return setError("Enter a state");
        if (!pincode.current.value) return setError("Enter a pincode");
        if (!validatePincode(pincode.current.value)) return setError("Enter a valid 6-digit pincode");


        const onSuccess = (url) => {
            window.location.href = url;
        }

        const onCODSuccess = (order_id) => {
            window.location.href = `/checkout/success?order=${order_id}`;
        }

        const onError = (e) => {
            console.error("Order Creation Error:", e);
            setError(e.message || "An unknown error occurred.");
        }

        const data = {
            name: {
                first: fname.current.value,
                last: lname.current.value,
            },
            email: email.current.value,
            phone_number: phone.current.value,
            address: {
                country: 'India',
                street: street.current.value,
                area: area.current.value,
                city: city.current.value,
                state: state.current.value,
                pincode: pincode.current.value,
            },
            payment_method: paymentMethod
        };

        if (paymentMethod === 'ONLINE') {
            dispatch(postOrder(cart.token, data, onSuccess, onError));
        } else {
            // For COD, we pass the data directly
            dispatch(postOrderCOD(cart.token, data, onCODSuccess, onError));
        }

    }
    const validatePhone = (phone) => {
        return String(phone)
            .toLowerCase()
            .match(
                /^[6-9]\d{9}$/
            );
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePincode = (pin) => {
        return String(pin).match(/^[1-9][0-9]{5}$/);
    };

    if (!cart) {
        return (
            <div className={styles['wrapper']}>
                <div className={'heading-wrapper'}>
                    <h1 className={'heading'}>Loading Checkout...</h1>
                </div>
            </div>
        )
    }

    return (
        <div className={styles['wrapper']}>
            {error && <Error error={error} setError={setError} />}
            <div className={'heading-wrapper'}>
                <h1 className={'heading'}>Checkout</h1>
            </div>

            <div className={styles['form']}>
                <input ref={fname} type="text" placeholder="First Name" />
                <input ref={lname} type="text" placeholder="Last Name" />

                <input ref={email} type="text" placeholder="Email" className={styles['full-width']} />
                <input ref={phone} type="text" placeholder="Phone (e.g., 9012345678)" className={styles['full-width']} />

                <input ref={street} type="text" placeholder="Street Address / Flat / Building" className={styles['full-width']} />
                <input ref={area} type="text" placeholder="Area / Locality" className={styles['full-width']} />

                <input ref={city} type="text" placeholder="City" />
                <input ref={state} type="text" placeholder="State" />

                <input ref={pincode} type="text" placeholder="Pincode" className={styles['full-width']} />
            </div>

            <div className={`${styles['payment-section']} ${styles['full-width']}`}>
                <h3>Payment Method</h3>
                <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="ONLINE"
                            checked={paymentMethod === 'ONLINE'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ marginRight: '10px', width: 'auto' }}
                        />
                        Online Payment (Card / UPI)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="COD"
                            checked={paymentMethod === 'COD'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ marginRight: '10px', width: 'auto' }}
                        />
                        Cash on Delivery (COD)
                    </label>
                </div>
            </div>

            <div className={styles['total']}>
                <div className={styles["total-text"]}>Total Price:</div>
                <div className={styles['total-amount']}>{cart.total} ₹</div>
            </div>

            <div className={styles['total-wrapper']}>
                <button onClick={handleCheckout} className={'btn1'}>
                    {paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order'}
                </button>
            </div>

        </div>
    )
}
export default Checkout;