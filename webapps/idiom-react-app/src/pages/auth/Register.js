import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "./auth.css"
import {Link, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {Alert} from "react-bootstrap";
import {getCSRFToken} from "../../utils/utils";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({})
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            navigate("/");
        }
    }, []);
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {}
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.username) newErrors.username = 'Username is required';
        else if (formData.username.length > 30) newErrors.username = 'Username must be less than 30 characters';
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\S]{8,16}$/.test(formData.password)) {
            newErrors.password = 'Password must be 8-16 characters with at least one uppercase letter, one lowercase letter, and one number';
        }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})
        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        try {
            const res = await fetch('/register_req', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    password: formData.password
                }),
                credentials: 'include'
            })
            const data = await res.json()
            console.log("Register response data: " + data)
            if (res.status === 201) {
                window.location.pathname = '/'
            } else {
                setErrors(data)
            }
        } catch (error) {
            setErrors({error: 'An error occurred. Please try again later.'})
        }
    }

    return (
        <div className="container auth_container">
            <h2 className="mt-4 fw-bolder text-center fs-1 title">Register</h2>
            <Form className="mx-auto" style={{width: "60%"}} onSubmit={handleSubmit}>
                {errors.error && <Alert variant="danger">{errors.error}</Alert>}

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="fs-6 fw-bold">Email address</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        isInvalid={!!errors.email}
                    />
                    {errors.email && <Form.Text className="text-danger">{errors.email}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label className="fs-6 fw-bold">Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        isInvalid={!!errors.username}
                    />
                    {errors.username && <Form.Text className="text-danger">{errors.username}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicLastName">
                    <Form.Label className="fs-6 fw-bold">Last name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter last name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        isInvalid={!!errors.lastName}
                    />
                    {errors.lastName && <Form.Text className="text-danger">{errors.lastName}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicFirstName">
                    <Form.Label className="fs-6 fw-bold">First name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter first name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        isInvalid={!!errors.firstName}/>
                    {errors.firstName && <Form.Text className="text-danger">{errors.firstName}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label className="fs-6 fw-bold">Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        isInvalid={!!errors.password}
                    />
                    <Form.Text className="text-muted d-block">
                        8-16 characters with upper- and lower-case letters and numbers
                    </Form.Text>
                    {errors.password && <Form.Text className="text-danger d-block">{errors.password}</Form.Text>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                    <Form.Label className="fs-6 fw-bold">Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        isInvalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && <Form.Text className="text-danger">{errors.confirmPassword}</Form.Text>}
                </Form.Group>

                <div className="d-flex justify-content-center" style={{paddingBottom: "15px"}}>
                    <Button className="button fw-bold" type="submit" size="lg">
                        Submit
                    </Button>
                </div>
                <div className="d-flex justify-content-center" style={{paddingBottom: "35px"}}>
                    <Link to={"/login"} className="fw-bold">Already have an account? Login now!</Link>
                </div>
            </Form>
        </div>
    )
}

export default Register;