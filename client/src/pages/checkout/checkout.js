import styles from './checkout.module.css';
import '../../shared/css/master.css';
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Error from "../../components/feedback/error/Error";
import { postOrder } from "../../actions/orders";
import QRCode from "react-qr-code";

const Checkout = () => {

  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [upiLink, setUpiLink] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const dispatch = useDispatch();
  const cart = useSelector(state => state.products.cart_validation || {});

  const fname = useRef();
  const lname = useRef();
  const email = useRef();
  const phone = useRef();
  const city = useRef();
  const area = useRef();
  const street = useRef();

  const formatINR = amt => `₹ ${Number(amt || 0).toLocaleString("en-IN")}`;

  const validatePhone = p => /^[6-9]\d{9}$/.test(p);
  const validateEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const startUPI = amount => {
    if (amount < 30) return setError("Minimum payment allowed is ₹30");

    const link = `upi://pay?pa=takshilnakrani@okaxis&pn=RabbitMart&am=${amount}&cu=INR&tn=Order`;

    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = link;
    } else {
      setUpiLink(link);
      setShowQR(true);
    }
  };

  const handleCheckout = () => {

    const token = localStorage.getItem("token");
    if (!token) return setError("Please login again");

    if (!fname.current.value) return setError("Enter first name");
    if (!lname.current.value) return setError("Enter last name");
    if (!validateEmail(email.current.value)) return setError("Invalid email");
    if (!validatePhone(phone.current.value)) return setError("Invalid mobile");

    const data = {
      products: cart.items,
      total: cart.total,
      address: {
        country: "India",
        city: city.current.value,
        area: area.current.value,
        street: street.current.value
      },
      payment_method: paymentMethod
    };

    // ✅ SUCCESS HANDLER (paid → success page)
    const onSuccess = (order) => {

      if (order.payment_status === "paid" && order.status === "paid") {
        window.location.href = "/success";
        return;
      }

      if (paymentMethod === "upi") startUPI(cart.total);

      if (paymentMethod === "cod")
        alert("Order placed successfully");
    };

    const onError = e => setError(e.message || "Order failed");

    dispatch(postOrder(token, data, onSuccess, onError));
  };

  if (!cart.total && !showQR) return <h2>Loading checkout...</h2>;

  return (
    <div className={styles.wrapper}>

      {error && <Error error={error} setError={setError} />}

      {!showQR && (
        <>
          <h1 className="heading">Checkout</h1>

          <div className={styles.form}>
            <input ref={fname} placeholder="First Name" />
            <input ref={lname} placeholder="Last Name" />
            <input ref={email} placeholder="Email" />
            <input ref={phone} placeholder="Mobile" />
            <input ref={city} placeholder="City" />
            <input ref={area} placeholder="Area" />
            <input ref={street} placeholder="Street" />
          </div>

          <div className={styles.paymentBox}>
            <label>
              <input type="radio" checked={paymentMethod==="upi"} onChange={()=>setPaymentMethod("upi")} />
              UPI
            </label>

            <label>
              <input type="radio" checked={paymentMethod==="cod"} onChange={()=>setPaymentMethod("cod")} />
              COD
            </label>
          </div>

          <div className={styles.total}>
            Total: <b>{formatINR(cart.total)}</b>
          </div>

          <button onClick={handleCheckout} className="btn1">
            Place Order
          </button>
        </>
      )}

      {showQR && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <h2>Scan & Pay</h2>
          <QRCode value={upiLink} size={260} />
        </div>
      )}

    </div>
  );
};

export default Checkout;
