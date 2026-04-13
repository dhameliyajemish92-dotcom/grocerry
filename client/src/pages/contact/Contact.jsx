import styles from './contact.module.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

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
        console.log('Contact form submitted:', formData);
        setSubmitted(true);
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
        <Container className={`py-5 ${styles['wrapper']}`}>
            <div className={`${styles['header']} text-center mb-5`}>
                <h1>Contact Us</h1>
                <p className="text-muted">Have questions? We'd love to hear from you.</p>
            </div>

            <Row className="mb-5">
                <Col lg={4} className="mb-4 mb-lg-0">
                    <Row>
                        <Col md={6} lg={12} className="mb-4">
                            <Card className="h-100 text-center shadow-sm">
                                <Card.Body>
                                    <h3 className="fs-1 mb-3">📱</h3>
                                    <Card.Title>WhatsApp</Card.Title>
                                    <Card.Text className="text-muted mb-2">Chat with us directly</Card.Text>
                                    <a href="https://wa.me/9313683554" target="_blank" rel="noreferrer" className="text-decoration-none fw-bold">
                                        9313683554
                                    </a>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={12} className="mb-4">
                            <Card className="h-100 text-center shadow-sm">
                                <Card.Body>
                                    <h3 className="fs-1 mb-3">📧</h3>
                                    <Card.Title>Email</Card.Title>
                                    <Card.Text className="text-muted mb-2">Send us an email</Card.Text>
                                    <a href="mailto:dhameliyajemish92@gmail.com" className="text-decoration-none fw-bold">
                                        dhameliyajemish92@gmail.com
                                    </a>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={12} className="mb-4">
                            <Card className="h-100 text-center shadow-sm">
                                <Card.Body>
                                    <h3 className="fs-1 mb-3">🕐</h3>
                                    <Card.Title>Business Hours</Card.Title>
                                    <Card.Text className="text-muted mb-2">We're available</Card.Text>
                                    <span className="fw-bold">Mon - Sat: 9AM - 9PM</span>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={12} className="mb-4">
                            <Card className="h-100 text-center shadow-sm">
                                <Card.Body>
                                    <h3 className="fs-1 mb-3">📍</h3>
                                    <Card.Title>Location</Card.Title>
                                    <Card.Text className="text-muted mb-2">Visit our store</Card.Text>
                                    <div className="ratio ratio-16x9">
                                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.467135275085!2d72.88133607454674!3d21.21331698141555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x63bda34bdc66ea7b%3A0x73a6ba289aca9c91!2sPicode%20Digital%20agency!5e0!3m2!1sen!2sin!4v1776062961775!5m2!1sen!2sin" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map"></iframe>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                <Col lg={8}>
                    <Card className={`p-4 p-md-5 shadow-sm h-100 ${styles['form-section']}`}>
                        <h2 className="mb-4">Send us a Message</h2>
                        {submitted ? (
                            <div className="text-center py-5">
                                <div className="display-1 text-success mb-3">✓</div>
                                <h3>Message Sent!</h3>
                                <p className="text-muted">Thank you for contacting us. We'll get back to you soon.</p>
                            </div>
                        ) : (
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4" controlId="name">
                                            <Form.Label>Your Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="John Doe"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4" controlId="phone">
                                            <Form.Label>Phone Number</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+91 98765 43210"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4" controlId="email">
                                    <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="subject">
                                    <Form.Label>Subject <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
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
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="message">
                                    <Form.Label>Your Message <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        placeholder="How can we help you?"
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" size="lg" className="w-100 mt-2">
                                    Send Message
                                </Button>
                            </Form>
                        )}
                    </Card>
                </Col>
            </Row>

            <div className={`mt-5 text-center ${styles['faq-section']}`}>
                <h2 className="mb-4">Frequently Asked Questions</h2>
                <Row>
                    <Col md={6} className="mb-4 text-start">
                        <Card className="h-100 shadow-sm border-0 bg-light">
                            <Card.Body>
                                <h4>How do I track my order?</h4>
                                <p className="text-muted">You can track your order by visiting the <Link to="/shipping" className="text-decoration-none">Track Shipping</Link> page and entering your order ID.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4 text-start">
                        <Card className="h-100 shadow-sm border-0 bg-light">
                            <Card.Body>
                                <h4>What is the delivery timeframe?</h4>
                                <p className="text-muted">We typically deliver within 20 minutes depending on your location.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4 text-start">
                        <Card className="h-100 shadow-sm border-0 bg-light">
                            <Card.Body>
                                <h4>How can I return a product?</h4>
                                <p className="text-muted">Contact us via WhatsApp or email within 2 days of delivery for return instructions.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4 text-start">
                        <Card className="h-100 shadow-sm border-0 bg-light">
                            <Card.Body>
                                <h4>Do you deliver to my area?</h4>
                                <p className="text-muted">We currently deliver across surat. Contact us to check delivery availability in your area.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}

export default Contact;
