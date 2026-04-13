import styles from './productCard.module.css';
import { useRef, useState } from "react";
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { updateWishlist } from "../../actions/auth";
import * as cartActions from "../../actions/cart";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProductCard = ({ product, productsPage = false, isInCart = false, cartQuantity = 0 }) => {
    const [quantity, setQuantity] = useState(1);
    const wrapperRef = useRef();
    const wishlist = useSelector(state => state.authentication.user?.wishlist) || [];
    const cart = useSelector(state => state.cart.cart) || [];
    const user = useSelector(state => state.authentication.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleWishlist = () => {
        const onError = () => {
            navigate('/login');
        };
        dispatch(updateWishlist(product.product_id || product.id, onError));
    };

    const handleAddToCart = async () => {
        const productId = product.product_id || product.id;
        const qty = quantity;
        
        if (user?.token) {
            await dispatch(cartActions.addToCartAsync(productId, qty));
        } else {
            const productIndex = cart.findIndex((cartProduct) => cartProduct.product_id === productId);
            let newCart;
            if (productIndex >= 0) {
                const updatedData = { ...cart[productIndex], quantity: cart[productIndex].quantity + qty };
                const newArray = [...cart];
                newArray[productIndex] = updatedData;
                newCart = newArray;
            } else {
                newCart = [...cart, { ...product, product_id: productId, quantity: qty }];
            }
            dispatch(cartActions.setCart(newCart));
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
        
        toast.success(`${product.name} x${quantity} added to cart!`);
        setQuantity(1);
    };



    const getXi = () => {
        const elementData = wrapperRef.current.getBoundingClientRect();
        return elementData.x;
    };

    const getXf = () => {
        const windowWidth = window.innerWidth;
        if (windowWidth > 1024)
            return windowWidth - 11 * 16;
        return windowWidth - 5 * 16;
    };

    const getYi = () => {
        const elementData = wrapperRef.current.getBoundingClientRect();
        return elementData.y;
    };

    return (
        <div ref={wrapperRef}
            className={`${styles['wrapper']} ${productsPage ? styles['products-page'] : ''} ${!(product.availability?.in_stock ?? product.stock) && styles['out-of-stock']}`}>

            {isInCart &&
                <motion.img initial={{
                    x: getXi(),
                    y: getYi(),
                    padding: '1em',
                    borderRadius: '10px'
                }}
                    animate={{
                        x: getXf(),
                        y: 0,
                        width: 24,
                        height: 24,
                        opacity: .8,
                        borderRadius: '50%',
                        padding: '.5em'
                    }}
                    transition={{ type: "spring", stiffness: 40, bounce: 0 }}
                    className={styles['cart-img']}
                    src={product.image}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
                    alt={product.name} />}

            <div className={styles['image-wrapper']}>
                <img src={product.image} alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=No+Image'; }} />
                <span onClick={handleWishlist}
                    className={`material-symbols-outlined ${styles['wishlist']} ${wishlist.includes(product.product_id || product.id) && styles['wishlisted']}`}>favorite</span>
            </div>

            <div className={styles['content']}>
                <p className={styles['name']}>{product.name}</p>
                <div className={styles['footer']}>
                    <div className={styles['details']}>
                        <p className={styles['weight']}>
                            {product.packaging ? `${product.packaging.quantity}${product.packaging.unit}` : `${product.weight}${product.measurement}`}
                        </p>
                        <p className={styles['price']}>
                            {product.pricing ? Number(product.pricing.selling_price).toFixed(2) : (product.price ? Number(product.price).toFixed(2) : '0.00')} ₹
                        </p>
                    </div>

                    {(product.availability?.in_stock ?? product.stock) ?
                        isInCart ? (
                            <div className={styles['add-section']}>
                                <div className={styles['quantity-controls']}>
                                    <button onClick={async () => {
                                        const productId = product.product_id || product.id;
                                        if (cartQuantity > 1) {
                                            if (user?.token) {
                                                await dispatch(cartActions.updateCartItemAsync(productId, cartQuantity - 1));
                                            } else {
                                                const newCart = cart.map(item => 
                                                    item.product_id === productId 
                                                        ? { ...item, quantity: item.quantity - 1 }
                                                        : item
                                                );
                                                dispatch(cartActions.setCart(newCart));
                                                localStorage.setItem('cart', JSON.stringify(newCart));
                                            }
                                        } else {
                                            if (user?.token) {
                                                await dispatch(cartActions.removeFromCartAsync(productId));
                                            } else {
                                                const newCart = cart.filter((cartItem) => cartItem.product_id !== productId);
                                                dispatch(cartActions.setCart(newCart));
                                                localStorage.setItem('cart', JSON.stringify(newCart));
                                            }
                                        }
                                    }} className={styles['qty-btn']} disabled={cartQuantity <= 0}>-</button>
                                    <span className={styles['qty-value']}>{cartQuantity}</span>
                                    <button onClick={async () => {
                                        const productId = product.product_id || product.id;
                                        if (user?.token) {
                                            await dispatch(cartActions.updateCartItemAsync(productId, cartQuantity + 1));
                                        } else {
                                            const newCart = cart.map(item => 
                                                item.product_id === productId 
                                                    ? { ...item, quantity: item.quantity + 1 }
                                                    : item
                                            );
                                            dispatch(cartActions.setCart(newCart));
                                            localStorage.setItem('cart', JSON.stringify(newCart));
                                        }
                                    }} className={styles['qty-btn']}>+</button>
                                </div>
                            </div>
                        ) : (

                            <div onClick={handleAddToCart} className={styles['add-to-cart']}>
                                Add to Cart
                            </div>
                        ) :
                        <div className={styles['unavailable']}>Out of Stock</div>}
                </div>
            </div>
        </div >
    );
};

export default ProductCard;