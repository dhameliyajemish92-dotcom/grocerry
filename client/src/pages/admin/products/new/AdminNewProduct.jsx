import styles from './adminNewProduct.module.css';
import {useState} from "react";
import {useDispatch} from "react-redux";
import {postProduct} from "../../../../actions/products";
import SuccessImage from "../../../../shared/assets/state/success.png";
import Error from "../../../../components/feedback/error/Error";

const FORM = 'FORM';
const SUCCESS = 'SUCCESS';

const INITIAL_PRODUCT = {
    product_id: '',
    name: '',
    brand: '',
    price: '',
    weight: '',
    measurement: 'kg',
    category: '',
    image: '',
    stock: ''
};

const AdminNewProduct = () => {

    const dispatch = useDispatch();
    const categories = ["Beverages", "Dairy", "Grains", "HomeCare", "Oils", "Personal Care", "Pulses", "Snacks", "Spices"];
    const [state, setState] = useState(FORM)
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [product, setProduct] = useState(INITIAL_PRODUCT);

    const handleChange = (e) => {
        let { name, value } = e.target;
        
        if (name === 'product_id') value = value.toUpperCase();
        if (name === 'measurement') value = value.toLowerCase();

        setProduct({...product, [name]: value});
    }

    const handleSubmit = () => {

        if (!product.product_id || product.product_id.length !== 6)
            return setError('Enter a 6 characters product id');

        if (!product.name)
            return setError('Enter a valid product name');

        if (!product.price)
            return setError('Enter a valid product price');
            
        if (!product.category)
            return setError('Enter a valid product category');

        if (!product.image || !product.image.match(/(https?:\/\/)?.*(\.png|\.jpg|\.jpeg)/))
            return setError('Enter a valid image URL');


        const onSuccess = () => {
            setIsLoading(false);
            setState(SUCCESS);
        }

        const onError = (e) => {
            setIsLoading(false);
            setError(e.message || "Failed to add product")
        }

        setIsLoading(true);
        dispatch(postProduct(product, onSuccess, onError));
    }

    const handleReset = () => {
        setState(FORM);
        setProduct(INITIAL_PRODUCT);
    }

    if (state === SUCCESS)
        return (
            <div className={styles['wrapper']}>
                <div className={styles['response-wrapper']}>
                    <img src={SuccessImage} alt={'Successfully Updated'}/>
                    <p>{product.name} was added successfully to the database</p>
                    <div className={'btn2'} onClick={handleReset}>Add More</div>
                </div>
            </div>
        )

    return (
        <div className={styles['wrapper']}>
            {error && <Error error={error} setError={setError}/>}
            <div className={'heading'}>
                <h1>New Product</h1>
            </div>
            <div className={styles['form']}>
                <input maxLength={6} placeholder={'Product Id (e.g. ABC123)'} name={'product_id'} value={product.product_id}
                       onChange={handleChange}/>
                <input placeholder={'Product Name'} name={'name'} value={product.name}
                       onChange={handleChange}/>
                <input placeholder={'Brand'} name={'brand'} value={product.brand}
                       onChange={handleChange}/>
                <input placeholder={'Price (₹)'} type={'number'} name={'price'} value={product.price}
                       onChange={handleChange}/>
                <input placeholder={'Weight/Qty'} type={'number'} name={'weight'} value={product.weight}
                       onChange={handleChange}/>
                <input placeholder={'Unit (kg/g/ml)'} maxLength={3} name={'measurement'} value={product.measurement}
                       onChange={handleChange}/>
                <select defaultValue={''} className={styles['full']} name={'category'}
                        onChange={handleChange}>
                    <option value={''} disabled={true}>Select Category</option>
                    {categories.map((category, i) => <option key={i} value={category}>{category}</option>)}
                </select>
                <input placeholder={'Initial Stock'} type={'number'} name={'stock'} value={product.stock}
                       onChange={handleChange}/>
                <input placeholder={'Image URL'} type={'url'} name={'image'} value={product.image}
                       className={styles['full']}
                       onChange={handleChange}/>
            </div>
            <button onClick={handleSubmit} className={`btn1 ${styles['submit']}`} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Product'}
            </button>
        </div>
    );
}

export default AdminNewProduct;