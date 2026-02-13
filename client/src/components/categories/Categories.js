import All from '../../shared/assets/categories/all.png';
import styles from './categories.module.css';
import { Link } from "react-router-dom";

const Categories = () => {
    const categories = [
        {
            display: "All",
            value: "",
            img: All
        },
        {
            display: "Beverages",
            value: "Beverages",
            img: All
        },
        {
            display: "Dairy",
            value: "Dairy",
            img: All
        },
        {
            display: "Grains",
            value: "Grains",
            img: All
        },
        {
            display: "HomeCare",
            value: "HomeCare",
            img: All
        },
        {
            display: "Oils",
            value: "Oils",
            img: All
        },
        {
            display: "PersonalCare",
            value: "PersonalCare",
            img: All
        },
        {
            display: "Pulses",
            value: "Pulses",
            img: All
        },
        {
            display: "Snacks",
            value: "Snacks",
            img: All
        },
        {
            display: "Spices",
            value: "Spices",
            img: All
        }
    ]

    return (
        <div className={styles['categories']}>
            <div className={`${styles['categories-scroll']}`}>
                {categories.map((item, i) =>
                    <Link key={i} to={`/products?category=${item.value}`} className={styles['category']}>
                        <div>{item.display}</div>
                        <img src={item.img} alt={item.display} />
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Categories;