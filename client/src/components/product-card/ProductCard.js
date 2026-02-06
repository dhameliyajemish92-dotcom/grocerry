import styles from './productCard.module.css';
import { useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { updateWishlist } from "../../actions/wishlist";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, addProductToCart, productsPage = false }) => {

  const [flyImage, setFlyImage] = useState(false);
  const wrapperRef = useRef(null);

  const wishlist = useSelector(
    state => state.authentication.user?.wishlist || []
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleWishlist = () => {
    const onError = () => navigate('/login');
    dispatch(updateWishlist(product.product_id, onError));
  };

  const handleAddToCart = () => {
    setFlyImage(true);

    setTimeout(() => {
      addProductToCart(product);
      setFlyImage(false);
    }, 700);
  };

  const rect = wrapperRef.current?.getBoundingClientRect();

  const startX = rect?.left || 0;
  const startY = rect?.top || 0;

  const endX = window.innerWidth - 80;
  const endY = 20;

  const sellingPrice = Number(product.price);
  const mrp = product.mrp || Math.round(sellingPrice * 1.25);
  const discount = Math.round(((mrp - sellingPrice) / mrp) * 100);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} 
      ${productsPage ? styles['products-page'] : ''} 
      ${!product.stock ? styles['out-of-stock'] : ''}`}
    >

      <AnimatePresence>
        {flyImage && (
          <motion.img
            src={product.image}
            className={styles['cart-img']}
            style={{ position: "fixed", zIndex: 9999 }}
            initial={{
              x: startX,
              y: startY,
              width: 120,
              height: 120,
              borderRadius: 12,
              opacity: 1
            }}
            animate={{
              x: endX,
              y: endY,
              width: 30,
              height: 30,
              opacity: 0.7,
              borderRadius: "50%"
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      <div className={styles['image-wrapper']}>
        <img src={product.image} alt={product.name} />

        <span
          onClick={handleWishlist}
          className={`material-symbols-outlined 
          ${styles.wishlist} 
          ${wishlist.includes(product.product_id) ? styles.wishlisted : ''}`}
        >
          favorite
        </span>
      </div>

      <div className={styles.content}>
        <p className={styles.name}>{product.name}</p>

        <div className={styles.footer}>
          <div className={styles.details}>
            <p className={styles.weight}>
              {product.weight}{product.measurement}
            </p>

            <div className={styles['price-box']}>
              <span className={styles['selling-price']}>
                ₹ {sellingPrice.toLocaleString('en-IN')}
              </span>

              <span className={styles.mrp}>
                ₹ {mrp.toLocaleString('en-IN')}
              </span>

              <span className={styles.discount}>
                {discount}% OFF
              </span>
            </div>
          </div>

          {product.stock ? (
            <div onClick={handleAddToCart} className={styles['add-to-cart']}>
              Add to Cart
            </div>
          ) : (
            <div className={styles.unavailable}>
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
