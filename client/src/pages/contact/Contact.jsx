import styles from './contact.module.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Contact form submitted:', formData);
        setSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        }, 3000);
    };

    return (
        <div className={styles['wrapper']}>
            <div className={styles['container']}>
                <div className={styles['header']}>
                    <h1>Contact Us</h1>
                    <p>Have questions? We'd love to hear from you.</p>
                </div>

                <div className={styles['content']}>
                    <div className={styles['contact-info']}>
                        <div className={styles['info-card']}>
                            <div className={styles['info-icon']}>📱</div>
                            <h3>WhatsApp</h3>
                            <p>Chat with us directly</p>
                            <a href="https://wa.me/9313683554" target="_blank" rel="noreferrer">
                                9313683554
                            </a>
                        </div>

                        <div className={styles['info-card']}>
                            <div className={styles['info-icon']}>📧</div>
                            <h3>Email</h3>
                            <p>Send us an email</p>
                            <a href="mailto:dhameliyajemish92@gmail.com">
                                dhameliyajemish92@gmail.com
                            </a>
                        </div>

                        <div className={styles['info-card']}>
                            <div className={styles['info-icon']}>🕐</div>
                            <h3>Business Hours</h3>
                            <p>We're available</p>
                            <span>Mon - Sat: 9AM - 9PM</span>
                        </div>

                        <div className={styles['info-card']}>
                            <div className={styles['info-icon']}>📍</div>
                            <h3>Location</h3>
                            <p>Visit our store</p>
                            <span>jakatnaka,surat, India</span>
                        </div>
                    </div>

                    <div className={styles['form-section']}>
                        <h2>Send us a Message</h2>
                        {submitted ? (
                            <div className={styles['success-message']}>
                                <span className={styles['success-icon']}>✓</span>
                                <h3>Message Sent!</h3>
                                <p>Thank you for contacting us. We'll get back to you soon.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles['contact-form']}>
                                <div className={styles['form-row']}>
                                    <div className={styles['form-group']}>
                                        <label htmlFor="name">Your Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className={styles['form-group']}>
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                <div className={styles['form-group']}>
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className={styles['form-group']}>
                                    <label htmlFor="subject">Subject *</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="order">Order Related</option>
                                        <option value="delivery">Delivery Issue</option>
                                        <option value="product">Product Inquiry</option>
                                        <option value="refund">Refund Request</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className={styles['form-group']}>
                                    <label htmlFor="message">Your Message *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <button type="submit" className={styles['submit-btn']}>
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className={styles['faq-section']}>
                    <h2>Frequently Asked Questions</h2>
                    <div className={styles['faq-grid']}>
                        <div className={styles['faq-item']}>
                            <h4>How do I track my order?</h4>
                            <p>You can track your order by visiting the <Link to="/shipping">Track Shipping</Link> page and entering your order ID.</p>
                        </div>
                        <div className={styles['faq-item']}>
                            <h4>What is the delivery timeframe?</h4>
                            <p>We typically deliver within 20 minutes depending on your location.</p>
                        </div>
                        <div className={styles['faq-item']}>
                            <h4>How can I return a product?</h4>
                            <p>Contact us via WhatsApp or email within 2 days of delivery for return instructions.</p>
                        </div>
                        <div className={styles['faq-item']}>
                            <h4>Do you deliver to my area?</h4>
                            <p>We currently deliver across surat. Contact us to check delivery availability in your area.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
