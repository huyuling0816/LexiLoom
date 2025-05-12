from django import forms

from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class LoginForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(max_length=200, widget=forms.PasswordInput())

    # Customizes form validation for properties that apply to more than one field
    # Overrides the forms.Form.clean function.
    def clean(self):
        # Calls our parent (forms.Form) .clean function
        # Gets a dictionary of cleaned data as a result
        cleaned_data = super().clean()

        # Confirms that the two password fields match
        username = cleaned_data.get('username')
        password = cleaned_data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            raise forms.ValidationError("Invalid username/password")

        # We must return the cleaned data we got from our parent.
        return cleaned_data


class RegisterForm(forms.Form):
    username = forms.CharField(max_length=20)
    password = forms.CharField(max_length=200,
                               label='Password',
                               widget=forms.PasswordInput())
    confirm_password = forms.CharField(max_length=200,
                                       label='Confirm',
                                       widget=forms.PasswordInput())
    email = forms.CharField(max_length=50,
                            label='E-mail',
                            widget=forms.EmailInput())
    first_name = forms.CharField(max_length=20,
                                 label='First Name')
    last_name = forms.CharField(max_length=20,
                                label='Last Name')

    # Customizes form validation for properties that apply to more than one field.
    # Overrides the forms.Form.clean function.
    def clean(self):
        # Calls our parent (forms.Form) .clean function
        # Gets a dictionary of cleaned data as a result
        cleaned_data = super().clean()

        # Add an extra validation
        # Confirms that the two password fields match
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')
        if password and confirm_password and password != confirm_password:
            # Generates a form error (non-field error)
            raise forms.ValidationError("Passwords did not match.")

        # We must return the cleaned data we got from our parent.
        return cleaned_data

    # Customizes form validation for the username field.
    def clean_username(self):
        # Confirms that the username is not already present in the User model database.
        username = self.cleaned_data.get('username')
        if User.objects.filter(username__exact=username):
            # Generates a field error specific to the field (username here)
            raise forms.ValidationError("Username is already taken.")

        # We must return the cleaned data we got from the cleaned_data dictionary
        return username