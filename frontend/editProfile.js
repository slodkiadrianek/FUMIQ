
            document.addEventListener('DOMContentLoaded', function() {
                // Get user ID from URL or local storage
                const userId = new URLSearchParams(window.location.search).get('id') || localStorage.getItem('userId');
                const errorAlert = document.getElementById('error-alert');
                const successAlert = document.getElementById('success-alert');
                const saveBtn = document.getElementById('save-profile-btn');
                const form = document.getElementById('edit-profile-form');

                // Load current profile data
                async function loadProfileData() {
                    try {
                        const response = await fetch(`/api/profile?id=${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(data.message || 'Failed to load profile');
                        }
                        
                        // Populate form fields
                        document.getElementById('firstName').value = data.firstName || '';
                        document.getElementById('lastName').value = data.lastName || '';
                        document.getElementById('email').value = data.email || '';
                        
                    } catch (error) {
                        errorAlert.textContent = error.message || 'Failed to load profile data';
                        errorAlert.classList.remove('d-none');
                    }
                }
                
                // Handle form submission
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    // Hide alerts
                    errorAlert.classList.add('d-none');
                    successAlert.classList.add('d-none');
                    
                    // Get form values
                    const firstName = document.getElementById('firstName').value;
                    const lastName = document.getElementById('lastName').value;
                    const email = document.getElementById('email').value;
                    
                    try {
                        saveBtn.disabled = true;
                        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
                        
                        // Send request to backend
                        const response = await fetch(`/api/update-profile?id=${userId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                                firstName,
                                lastName,
                                email
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(data.message || 'Failed to update profile');
                        }
                        
                        // Show success message
                        successAlert.textContent = data.message || 'Profile updated successfully!';
                        successAlert.classList.remove('d-none');
                        
                        // Optionally redirect after success
                        setTimeout(() => {
                            window.location.href = 'profile.html';
                        }, 1500);
                        
                    } catch (error) {
                        errorAlert.textContent = error.message || 'An error occurred while updating profile.';
                        errorAlert.classList.remove('d-none');
                    } finally {
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Save Changes';
                    }
                });
                
                // Load profile data when page loads
                loadProfileData();
            });