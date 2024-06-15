<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

document.getElementById('loginForm').addEventListener('submit', function(event) {
    
    event.preventDefault(); // Prevent the form from submitting

    // Get selected category (User or Provider)
    var selectedCategory = document.querySelector('input[name="btnradio"]:checked').value;
    console.log(selectedCategory);

    // Get password input value
    var password = document.getElementById('exampleInputPassword1').value;



    // Validate password based on category
    if (selectedCategory === 'user') {
        // Validate user password
        if (password === 'user_password') { // Replace 'user_password' with actual user password
            alert('User login successful');
            // Send user data or redirect to user page
        } else {
            alert('Incorrect user password');
        }
    } else if (selectedCategory === 'provider') {
        // Validate provider password
        if (password === 'provider_password') { // Replace 'provider_password' with actual provider password
            alert('Provider login successful');
            // Send provider data or redirect to provider page
        } else {
            alert('Incorrect provider password');
        }
    }

    const loginButton = document.getElementById("loginButton");

    // Add a click event listener to the button
    loginButton.addEventListener("click", function() {
      // Change the path when the button is clicked
      console.log("login");
      window.location.href = "/login"; // Redirect to the '/login' route
    });

    
    // $(document).ready(function() {
    //     $('#registrationForm').submit(function(event) {
    //         event.preventDefault(); // Prevent default form submission
    
    //         // Retrieve form data
    //         var formData = {
    //             firstName: $('#validationDefault01').val(),
    //             lastName: $('#validationDefault02').val(),
    //             email: $('#validationDefaultEmail').val(),
    //             city: $('#validationDefault03').val(),
    //             phoneNumber: $('#validationDefault04').val(),
    //             password: $('#validationDefault05').val(),
    //             userCategory: $('#validationDefault04').val(), // Assuming this is the user category field
    //             agreeToTerms: $('#invalidCheck2').is(':checked')
    //         };
    
    //         // Send AJAX request to server
    //         $.ajax({
    //             url: '/register', // URL to your server-side route for registration
    //             method: 'POST',
    //             data: formData,
    //             success: function(response) {
    //                 // Handle successful registration response
    //                 alert('Registration successful!'); // Show success message
    //                 // You can redirect to a new page here if needed
    //             },
    //             error: function(xhr, status, error) {
    //                 // Handle registration error
    //                 alert('Registration failed. Please try again.'); // Show error message
    //             }
    //         });
    //     });
    // });
    
    
});
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('exampleInputPassword1');
    const togglePassword = document.querySelector('.toggle-password');

    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye-slash');
    togglePassword.classList.toggle('fa-eye');
}

// Your connection query and result handling
connection.query(`SELECT * FROM ${login.btnradio.toLowerCase()} WHERE Email = ?`, [emailChecker], (err, results) => {
    if (err) {
        console.error('Error occurred:', err);
        alert('An error occurred while checking email.');
    } else {
        if (results.length > 0) {
            // Show warning message if email already exists
            document.getElementById('emailWarning').style.display = 'block';
        }
    }
});
