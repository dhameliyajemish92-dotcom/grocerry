import styles from './wishlist.module.css';
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {getWishlist} from "../../actions/auth";
import Loading from "../../components/loading/Loading";
import ProductCard from "../../components/product-card/ProductCard";
import Error from "../../components/feedback/error/Error";

const Wishlist = () => {
    const cart = useSelector(state => state.cart.cart) || [];
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        const onSuccess = (wishlist) => {
            setProducts(wishlist);
            setLoading(false)
        }

        const onError = (e) => {
            setError(e.message);
            setLoading(false);
        }

        dispatch(getWishlist(onSuccess, onError));
    }, [dispatch])

    if (loading)
        return <Loading/>

    return (
        <div className={styles['wrapper']}>
            {error && <Error error={error} setError={setError}/>}
            <div className={'heading'}>
                <h1>Wishlist</h1>
            </div>
            {!products?.length ?
                <div className={styles['no-products']}>
                    <p>No products found in your wishlist</p>
                    <Link to={'/products'} className={'btn1'}>Explore Products</Link>
                </div> :
                <div className={styles['products-wrapper']}>
                    {products.map((product, i) => {
                        const productId = product.product_id || product.id;
                        const isInCart = cart?.some(c => (c.product_id || c.id) === productId);
                        const cartItem = cart?.find(c => (c.product_id || c.id) === productId);
                        return <ProductCard product={product}
                                           key={i}
                                           isInCart={isInCart}
                                           cartQuantity={cartItem?.quantity || 0}
                        />;
                    })}
                </div>
            }
        </div>
    );
}

export default Wishlist;