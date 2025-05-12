import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "./auth.css"
import {Link, useNavigate} from "react-router-dom";
import {getCSRFToken} from "../../utils/utils";
import {useEffect, useState} from "react";
import {Alert} from "react-bootstrap";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
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
        if (!formData.email) newErrors.email = 'Please input your email'
        if (!formData.password) newErrors.password = 'Please input your password'
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
            const res = await fetch('/login_req', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                credentials: "include", 
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            })
            const data = await res.json()
            if (res.status === 200) {
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
            <h2 className="mt-4 fw-bolder text-center fs-1 title">Login</h2>
            <Form className="w-50 mx-auto" onSubmit={handleSubmit}>
                {errors.error && <Alert variant="danger">{errors.error}</Alert>}

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="fs-6 fw-bold">Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        isInvalid={!!errors.email}
                    />
                    {errors.email && <Form.Text className="text-danger">{errors.email}</Form.Text>}
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
                    {errors.password && <Form.Text className="text-danger d-block">{errors.password}</Form.Text>}
                </Form.Group>

                <div className="d-flex justify-content-center" style={{paddingBottom: "15px"}}>
                    <Button className="button fw-bold" type="submit" size="lg">
                        Submit
                    </Button>
                    <Button className="button fw-bold" style={{marginLeft: '20px'}} size="lg"
                            onClick={() => window.location.href = window.GOOGLE_OAUTH_URL}>
                        Login with Google
                    </Button>
                </div>

                <div className="d-flex justify-content-center" style={{paddingBottom: "35px"}}>
                    <Link to={"/register"} className="fw-bold">Don't have an account yet? Register now!</Link>
                </div>
            </Form>
        </div>
    )
}

export default Login;