import styles from './cart.module.css';
import CartItem from "../../components/cart-item/CartItem";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { validateCart } from "../../actions/products";
import { useState } from "react";
import Error from "../../components/feedback/error/Error";

const Cart = ({ cart, cartCount, updateQuantity }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  const handleCheckout = () => {
    const onSuccess = (token) => {
      navigate(`/checkout?token=${token}&total=${getTotal()}`);
    };

    const onError = (e) => {
      setError(e.message);
    };

    dispatch(validateCart(cart, onSuccess, onError));
  };

  const getTotal = () => {
    let total = 0;
    for (const item of cart) {
      total += item.price * item.quantity;
    }
    return total;
  };

  const formatINR = (amount) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  };

  if (cart && !cart.length)
    return (
      <div className={styles.wrapper}>
        <div className="heading">
          <h1>Shopping Cart</h1>
        </div>
        <div className={styles['no-items']}>Your cart is empty</div>
        <Link to="/products" className="btn1">Start Shopping</Link>
      </div>
    );

  return (
    <div className={styles.wrapper}>
      {error && <Error error={error} setError={setError} />}

      <div className="heading">
        <h1>Shopping Cart</h1>
      </div>

      <div className={styles['products-wrapper']}>
        {cart.map((product, i) => (
          <CartItem
            product={product}
            updateQuantity={updateQuantity}
            key={i}
          />
        ))}
      </div>

      <div className={styles['total-wrapper']}>
        <div className={styles['total-text']}>
          Total ({cartCount} Items):
        </div>
    <div className={styles['total-amount']}>
  ₹ {Number(getTotal()).toLocaleString("en-IN")}
</div>

      </div>

      <div onClick={handleCheckout} className="btn1">
        Checkout
      </div>
    </div>
  );
};

export default Cart;
