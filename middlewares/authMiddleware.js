const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = (allowedRoles) => {
    // Middleware function to check if the user is authenticated and has the required role
    // allowedRoles: an array of roles that are allowed to access the route
    return async (request, response, next) => {
        try {
            //   get the token from the authorization header
            const token = await request.headers.authorization.split(" ")[1];

            //check if the token matches the supposed origin
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            // retrieve the user details of the logged in user
            const user = decodedToken;
            
            // Kiểm tra vai trò của người dùng
            if (!allowedRoles.includes(user.role)) {
                return response.status(403).json({
                    message: "Access denied: insufficient role permissions"
                });
            }

            // pass the user down to the endpoints here
            request.user = user;
            // pass down functionality to the endpoint
            next();

        } catch (error) {
            response.status(401).json({
                error: new Error("Invalid request!"),
            });
        }
    };
};