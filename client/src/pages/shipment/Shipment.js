import styles from './shipment.module.css';
import {useState, useRef} from "react";
import {useDispatch} from "react-redux";
import Error from "../../components/feedback/error/Error";
import {useNavigate} from "react-router-dom";
import {fetchShipment} from "../../actions/shipping";

const Shipment = () => {

    const dispatch = useDispatch();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef();
    const navigate = useNavigate();

    const handleFetch = () => {
        if (isLoading) return;

        const orderId = inputRef.current.value.trim();
        
        if (orderId.length !== 6) {
            return setError('Please enter exactly 6 characters for the order ID');
        }
        
        // Check if it's alphanumeric
        if (!/^[A-Za-z0-9]{6}$/.test(orderId)) {
            return setError('Order ID must be exactly 6 alphanumeric characters');
        }

        setIsLoading(true);
        setError('');

        const onSuccess = (shipment) => {
            setIsLoading(false);
            navigate(`/shipping/${shipment.order_id}`)
        }

        const onError = (e) => {
            setIsLoading(false);
            setError(e.message || 'Failed to fetch shipment details')
        }

        dispatch(fetchShipment(orderId.toUpperCase(), onSuccess, onError))
    }

    return (
        <div className={styles['wrapper']}>
            {error && <Error error={error} setError={setError}/>}
            <div className={'heading'}>
                <h1>Track Shipping</h1>
            </div>
            <div>Please provide your shipment id (6 characters)</div>
            <input 
                placeholder={'6 Characters Id (e.g., ABC123)'} 
                maxLength={6} 
                minLength={6}
                pattern="[A-Za-z0-9]{6}"
                title="Please enter exactly 6 alphanumeric characters"
                ref={inputRef} 
                type="text"
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => {
                    // Auto-uppercase and validate
                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, '');
                }}
            />
            <div className={'btn1'} onClick={handleFetch} style={{ opacity: isLoading ? 0.7 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
                {isLoading ? 'Fetching...' : 'Get Shipment Status'}
            </div>
        </div>
    );

}
export default Shipment;

