1. User Endpoints
HTTP Method	Endpoint	Description
POST	/api/users/register	Register a new user
GET	/api/users/verify-email/:token	Verify a user's email using a token
POST	/api/users/login	Login a user
POST	/api/users/logout	Logout a user
GET	/api/users/profile	Get the current user's profile
PUT	/api/users/profile	Update the current user's profile
POST	/api/users/change-password	Change the current user's password
POST	/api/users/forgot-password	Send a password reset link
POST	/api/users/reset-password/:token	Reset user's password using a token
POST	/api/users/toggle-2fa	Enable/Disable Two-Factor Authentication
POST	/api/users/upload/profile-picture	Upload or update a user's profile picture
GET	/api/users/search	Search for users
POST	/api/users/add	Add a new user (Admin only)
2. Video Endpoints
HTTP Method	Endpoint	Description
POST	/api/videos/upload	Upload a new video
GET	/api/videos	Get all videos
PUT	/api/videos/:id/like	Like a specific video
POST	/api/videos/:id/comment	Comment on a specific video
GET	/api/videos/:id/stream	Stream a specific video
GET	/api/videos/:id/analytics	Get analytics data for a specific video
DELETE	/api/videos/:id	Delete a specific video (Admin or Moderator)
GET	/api/videos/:id/embed	Get embeddable link for a specific video
3. Feed Endpoints
HTTP Method	Endpoint	Description
GET	/api/feed	Get the media feed
4. Analytics Endpoints
HTTP Method	Endpoint	Description
GET	/api/analytics	Get analytics data
GET	/api/analytics/video/:id	Get analytics data for a specific video
GET	/api/analytics/user/:id	Get analytics data for a specific user
5. Moderation Endpoints
HTTP Method	Endpoint	Description
POST	/api/moderation/report	Report content for review
GET	/api/moderation/reports	Get all reports (Admin or Moderator only)
POST	/api/moderation/resolve	Resolve a report (Admin or Moderator only)
6. Other Potential Endpoints
Search Routes:

GET /api/search - Perform a search across videos, users, and other content.
Notification Routes:

GET /api/notifications - Get notifications for the current user.
PUT /api/notifications/mark-read - Mark notifications as read.
Example Endpoint Implementations
