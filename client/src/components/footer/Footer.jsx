import styles from './footer.module.css';
import Logo from '../../shared/assets/logo.png';
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className={styles['wrapper']}>
            <div className={styles['top-wrapper']}>
                <div className={styles['brand-section']}>
                    <div className={styles['logo-wrapper']}>
                        <img src={Logo} alt={'GrocerApp'} />
                    </div>
                    <p className={styles['brand-desc']}>
                        Fresh groceries delivered to your doorstep. Quality products at the best prices.
                    </p>
                </div>
                
                <div className={styles['links-section']}>
                    <div className={styles['links-column']}>
                        <div className={styles['page-title']}>Quick Links</div>
                        <div className={styles['pages-list']}>
                            <Link to={'/'}>Home</Link>
                            <Link to={'/products'}>All Products</Link>
                            <Link to={'/cart'}>Shopping Cart</Link>
                            <Link to={'/orders'}>My Orders</Link>
                        </div>
                    </div>
                    
                    <div className={styles['links-column']}>
                        <div className={styles['page-title']}>Categories</div>
                        <div className={styles['pages-list']}>
                            <Link to={'/products?category=Beverages'}>Beverages</Link>
                            <Link to={'/products?category=Dairy'}>Dairy</Link>
                            <Link to={'/products?category=Grains'}>Grains</Link>
                            <Link to={'/products?category=Snacks'}>Snacks</Link>
                        </div>
                    </div>
                    
                    <div className={styles['links-column']}>
                        <div className={styles['page-title']}>Help & Support</div>
                        <div className={styles['pages-list']}>
                            <Link to={'/orders'}>Track Order</Link>
                            <Link to={'/shipping'}>Track Shipping</Link>
                            <Link to={'/contact'}>Contact Us</Link>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={styles['bottom-bar']}>
                <div className={styles['copyright']}>
                    © {new Date().getFullYear()} GrocerApp. Made with ❤️ by Jemish Dhameliya
                </div>
            </div>
        </div>
    );
}

export default Footer;
