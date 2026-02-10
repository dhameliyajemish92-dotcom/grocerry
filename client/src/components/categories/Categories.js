import All from '../../shared/assets/categories/all.png';
import styles from './categories.module.css';
import {Link} from "react-router-dom";

const Categories = () => {
    const categories = [
        {
            display: "All",
            img: All
        },
        {
            display: "Beverages",
            img: All
        },
        {
            display: "Dairy",
            img: All
        },
        {
            display: "Grains",
            img: All
        },
        {
            display: "HomeCare",
            img: All
        },
        {
            display: "Oils",
            img: All
        },
        {
            display: "Personal Care",
            img: All
        },
        {
            display: "Pulses",
            img: All
        },
        {
            display: "Snacks",
            img: All
        },
        {
            display: "Spices",
            img: All
        }
    ]

    return (
        <div className={styles['categories']}>
            <div className={`${styles['categories-scroll']}`}>
                {categories.map((item, i) =>
                    <Link key={i} to={`/products?category=${item.display}`} className={styles['category']}>
                        <div>{item.display}</div>
                        <img src={item.img} alt={item.display}/>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Categories;