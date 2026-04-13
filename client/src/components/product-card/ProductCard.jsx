import styles from './productCard.module.css';
import { useRef, useState } from "react";
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { updateWishlist } from "../../actions/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProductCard = ({ product, addProductToCart, productsPage = false, isInCart = false, cartQuantity = 0 }) => {
    const [quantity, setQuantity] = useState(1);
    const wrapperRef = useRef();
    const wishlist = useSelector(state => state.authentication.user?.wishlist) || [];
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleWishlist = () => {
        const onError = () => {
            navigate('/login');
        };
        dispatch(updateWishlist(product.product_id || product.id, onError));
    };

    const handleAddToCart = () => {
        const productWithQuantity = {
            ...product,
            quantity
        };
        addProductToCart(productWithQuantity);
        toast.success(`${product.name} x${quantity} added to cart!`);
        setQuantity(1);
    };

    const handleIncrement = () => {
        const maxStock = product.availability?.in_stock ?? product.stock ?? 99;
        if (quantity < maxStock) {
            setQuantity(quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
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
                                    <button onClick={() => {
                                        if (cartQuantity > 1) {
                                            addProductToCart({ ...product, quantity: -1 });
                                        } else {
                                            addProductToCart({ ...product, quantity: 0, remove: true });
                                        }
                                    }} className={styles['qty-btn']} disabled={cartQuantity <= 0}>-</button>
                                    <span className={styles['qty-value']}>{cartQuantity}</span>
                                    <button onClick={() => addProductToCart({ ...product, quantity: 1 })} className={styles['qty-btn']}>+</button>
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
