import React, {useState, useEffect, useRef, use} from 'react';
import {Form, Button, Alert} from 'react-bootstrap';
import {useAuth} from '../../store/authContext';
import {getCSRFToken} from '../../utils/utils';
import {useNavigate} from 'react-router-dom';
import './Profile.css';
import {fetchWithAuth} from "../../utils/fetchWithAuth";

const Profile = () => {
    const auth = useAuth();
    const {isLogin, updateUsername} = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: '',
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        avatar: '/static/profile_images/default_avatar.png'
    });

    const [formValues, setFormValues] = useState({
        username: '',
        firstName: '',
        lastName: ''
    });

    const [formErrors, setFormErrors] = useState({
        username: '',
        firstName: '',
        lastName: ''
    });

    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState({text: '', type: ''});
    const [stats, setStats] = useState({
        winRate: 0,
        collectionCount: 0,
        testScores: []
    });
    const avatarInputRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (isLogin) {
            fetchUserInfo();
        }
    }, [isLogin]);

    useEffect(() => {
        if (user.id) {
            fetchUserStats(user.id);
        }
    }, [user.id]);

    const fetchUserInfo = () => {
        fetchWithAuth("/get_user_status", {},
            auth)
            .then(res => res.json())
            .then(data => {
                if (data.is_authenticated) {
                    setUser({
                        id: data.user_id,
                        username: data.username,
                        email: data.email,
                        firstName: data.first_name || '',
                        lastName: data.last_name || '',
                        avatar: data.avatar || '/static/profile_images/default_avatar.png'
                    });
                }
            })
            .catch(err => {
                console.error('Error fetching user info:', err);
                setMessage({
                    text: 'Failed to load user information. Please try again later.',
                    type: 'danger'
                });
            });
    };

    const fetchUserStats = (userId) => {
        fetchWithAuth(`/get_winning_rate/${userId}/`, {}, auth)
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setStats(prevStats => ({
                        ...prevStats,
                        winRate: (data.winning_rate * 100).toFixed(1)
                    }));
                }
            })
            .catch(err => {
                console.error('Error fetching win rate:', err);
            });

        fetchWithAuth('/get_my_collection', {}, auth)
            .then(res => res.json())
            .then(data => {
                if (data && typeof data.total_items === 'number') {
                    setStats(prevStats => ({
                        ...prevStats,
                        collectionCount: data.total_items
                    }));
                }
            })
            .catch(err => {
                console.error('Error fetching collection count:', err);
            });
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        if (!editing) {
            setFormValues({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            });
        }
        setEditing(!editing);
    };

    const handleSubmit = () => {
        const errors = {};

        if (!formValues.username.trim()) {
            errors.username = "Username cannot be empty";
        } else if (formValues.username.length > 30) {
            errors.username = "Username must be less than 30 characters";
        }

        if (!formValues.firstName.trim()) {
            errors.firstName = "First name cannot be empty";
        }

        if (!formValues.lastName.trim()) {
            errors.lastName = "Last name cannot be empty";
        }

        if (Object.keys(errors).length > 0) {
            let errorMessage = "Please fix the validation errors";
            
            if (Object.keys(errors).length === 1 && errors.username === "Username must be less than 30 characters") {
                errorMessage = "Username is too long";
            }
            else if (Object.values(errors).every(error => error.includes("cannot be empty"))) {
                errorMessage = "Please fill in all required fields";
            }
            
            setMessage({
                text: errorMessage,
                type: "danger"
            });
            setFormErrors(errors);
            return;
        }
        fetchWithAuth('/edit_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                id: user.id,
                username: formValues.username,
                firstname: formValues.firstName,
                lastname: formValues.lastName
            })
        }, auth)
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    setMessage({
                        text: data.message,
                        type: 'success'
                    });

                    updateUsername(formValues.username);

                    setEditing(false);
                    fetchUserInfo();
                } else if (data.error) {
                    setMessage({
                        text: data.error,
                        type: 'danger'
                    });
                }
            })
            .catch(err => {
                console.error('Error updating profile:', err);
                setMessage({
                    text: 'Failed to update profile. Please try again later.',
                    type: 'danger'
                });
            });
    };

    const handleAvatarClick = () => {
        if (!editing) {
            avatarInputRef.current.click();
        }
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const formData = new FormData();
            formData.append('avatar', e.target.files[0]);

            fetchWithAuth('/edit_profile_picture', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                },
                body: formData
            }, auth)
                .then(res => res.json())
                .then(data => {
                    if (data.message) {
                        setMessage({
                            text: data.message,
                            type: 'success'
                        });
                        setUser(prevUser => ({
                            ...prevUser,
                            avatar: data.avatar_url
                        }));
                    } else if (data.error) {
                        setMessage({
                            text: data.error,
                            type: 'danger'
                        });
                    }
                })
                .catch(err => {
                    console.error('Error updating avatar:', err);
                    setMessage({
                        text: 'Failed to update profile picture. Please try again later.',
                        type: 'danger'
                    });
                });
        }
    };

    return (
        <div className="profile-container">
            {message.text && (
                <Alert variant={message.type} onClose={() => setMessage({text: '', type: ''})} dismissible>
                    {message.text}
                </Alert>
            )}

            <div className="profile-header">
                <div
                    className={`avatar-container ${editing ? 'editing' : ''}`}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={handleAvatarClick}
                    style={{cursor: !editing ? 'pointer' : 'default'}}
                >
                    <img src={user.avatar} alt="Profile" className="avatar"/>
                    {!editing && isHovering && (
                        <div className="avatar-overlay">
                            <i className="bi bi-camera-fill"></i>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarChange}
                        style={{display: 'none'}}
                        accept="image/*"
                    />
                </div>

                <div className="user-info">
                    <h2>{user.username}</h2>
                    <p>{user.email}</p>
                    {!editing && (
                        <button onClick={handleEditToggle} className="edit-button">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {editing ? (
                <div className="form-container">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={formValues.username}
                                onChange={handleInputChange}
                                isInvalid={!!formErrors.username}
                            />
                            {formErrors.username && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.username}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={formValues.firstName}
                                onChange={handleInputChange}
                                isInvalid={!!formErrors.firstName}
                            />
                            {formErrors.firstName && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.firstName}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={formValues.lastName}
                                onChange={handleInputChange}
                                isInvalid={!!formErrors.lastName}
                            />
                            {formErrors.lastName && (
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.lastName}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={user.email}
                                disabled
                            />
                            <Form.Text className="text-muted">
                                Email cannot be changed.
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-center button-container">
                            <Button
                                variant="secondary"
                                onClick={handleEditToggle}
                                className="cancel-button"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                className="save-button"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                </div>
            ) : (
                <>
                    <div className="profile-section">
                        <h3 className="section-title">Statistics</h3>
                        <div className="stats-container">
                            <div className="stat-card">
                                <h4>Win Rate</h4>
                                <div className="stat-value">{stats.winRate}%</div>
                                <p>in Battle Games</p>
                            </div>
                            <div className="stat-card" 
                                 onClick={() => navigate('/collection')}
                                 style={{cursor: 'pointer'}}>
                                <h4>Collection</h4>
                                <div className="stat-value">{stats.collectionCount}</div>
                                <p>Idioms Saved</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;