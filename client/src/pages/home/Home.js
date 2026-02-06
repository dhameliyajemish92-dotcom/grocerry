import styles from './home.module.css';
import { Link } from "react-router-dom";
import DeliveryImg from '../../shared/assets/delivery.png';
import Categories from "../../components/categories/Categories";
import ProductCard from "../../components/product-card/ProductCard";

import DeliveryIcon from '../../shared/assets/why/delivery.png';
import ReliableIcon from '../../shared/assets/why/reliable.png';
import PricesIcon from '../../shared/assets/why/prices.png';

import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../components/loading/Loading";

const Home = ({ addProductToCart }) => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/products")
      .then(res => {
        // backend may return {products: []} or just []
        const data = res.data.products || res.data;
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return <Loading />;

  return (
    <div className={styles['wrapper']}>

      {/* HERO SECTION */}
      <div className={styles['hero']}>
        <div className={styles['hero-text']}>
          <h1>Groceries and more in <span>20</span> minutes</h1>
          <p>Making on-demand retail a reality!</p>
          <Link className={'btn1'} to={'products'}>Shop Now</Link>
        </div>

        <div className={styles['delivery']}>
          <motion.img
            drag
            dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
            src={DeliveryImg}
            alt="Delivery"
          />
        </div>
      </div>

      {/* CATEGORIES */}
      <section>
        <div className={'heading-wrapper'}>
          <h1 className={'heading'}>Categories</h1>
        </div>
        <Categories />
      </section>

      {/* PRODUCTS FROM MONGODB */}
      <section>
        <div className={'heading-wrapper'}>
          <h1 className={'heading'}>Products</h1>
        </div>

        <div className={styles['products-wrapper']}>
          {products.map((product, i) => (
            <ProductCard
              key={i}
              product={product}
              addProductToCart={addProductToCart}
            />
          ))}
        </div>

        <Link to={'/products'} className={`btn1 ${styles['see-all']}`}>
          See All
        </Link>
      </section>

      {/* WHY SECTION */}
      <div className={styles['why']}>

        <div className={styles['why-component']}>
          <img src={DeliveryIcon} alt="Delivery" />
          <div className={'why-text'}>
            <div className={styles['why-title']}>Under 20 minutes</div>
            <div className={styles['why-desc']}>Delivered on time - Every time!</div>
          </div>
        </div>

        <div className={styles['why-component']}>
          <img src={ReliableIcon} alt="Reliable" />
          <div className={'why-text'}>
            <div className={styles['why-title']}>Reliable</div>
            <div className={styles['why-desc']}>Get what you order - Every time!</div>
          </div>
        </div>

        <div className={styles['why-component']}>
          <img src={PricesIcon} alt="Prices" />
          <div className={'why-text'}>
            <div className={styles['why-title']}>Amazing prices</div>
            <div className={styles['why-desc']}>Offers offers offers - Every time!</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
