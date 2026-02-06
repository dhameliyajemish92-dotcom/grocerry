import styles from './products.module.css';
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { getProductsPerPage, productsSearch } from "../../actions/products";

import ProductCard from "../../components/product-card/ProductCard";
import Pages from "../../components/pages/Pages";
import Categories from "../../components/categories/Categories";
import Loading from "../../components/loading/Loading";

const Products = ({ addProductToCart }) => {

  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const query = new URLSearchParams(location.search);
    const currentPage = query.get('page') || 1;

    setPage(Number(currentPage));

    if (query.get('search')) {
      const search = query.get('search');
      dispatch(productsSearch(search, currentPage, onSuccess));

    } else if (query.get('category')) {
      const category = query.get('category');

      if (category === 'All') {
        dispatch(getProductsPerPage(currentPage, null, onSuccess));
      } else {
        dispatch(getProductsPerPage(currentPage, category, onSuccess));
      }

    } else {
      dispatch(getProductsPerPage(currentPage, null, onSuccess));
    }

  }, [dispatch, location.search]);

  const onSuccess = (res) => {
    setTotalPages(res.total_pages);
    setProducts(res.products);
    setLoading(false);
  };

  const handleClick = (i) => {
    const query = new URLSearchParams(location.search);

    if (query.get('search')) {
      navigate(`/products?search=${query.get('search')}&page=${i}`);

    } else if (query.get('category')) {
      navigate(`/products?category=${query.get('category')}&page=${i}`);

    } else {
      navigate(`/products?page=${i}`);
    }

    window.scrollTo(0, 0);
  };

  return (
    <div className={styles.wrapper}>

      <div className="heading">
        <h1>Products</h1>
      </div>

      <Categories />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className={styles['products-wrapper']}>
            {products.map((product, i) => (
              <ProductCard
                key={i}
                product={product}
                addProductToCart={addProductToCart}
                productsPage={true}
              />
            ))}
          </div>

          <Pages
            max={totalPages}
            current={page}
            onPageClick={handleClick}
          />
        </>
      )}
    </div>
  );
};

export default Products;
